import { createHash, randomBytes } from "node:crypto";
import { cloudConfig } from "./cloud-config.js";
import { HttpError, exportLibrary, importLibrary, validateLibrary } from "./extension-library.js";

export const hashToken = token => createHash("sha256").update(token).digest("hex");
const MAX_BODY_BYTES = 4_000_000;

function bearer(request) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization || "");
  if (!match || match[1].length > 8192) throw new HttpError(401, "请重新登录");
  return match[1];
}

// No upstream error body, URL, headers or tokens are logged or returned to clients.
export function createExtensionHandler({ fetchImpl = fetch, config = cloudConfig } = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    const settings = config();
    const call = async (path, { method = "GET", body, accessToken, admin = true } = {}) => {
      const key = admin ? settings.secretKey : settings.publicKey;
      if (!key) throw new HttpError(503, "扩展服务尚未配置，请稍后重试");
      let upstream;
      try {
        upstream = await fetchImpl(new URL(path, settings.url), {
          method, headers: { apikey: key, Authorization: `Bearer ${accessToken || key}`,
            "Content-Type": "application/json", Prefer: "return=representation" },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(15000), redirect: "error",
        });
      } catch { throw new HttpError(502, "云端暂时无法连接，请重试"); }
      const data = await upstream.json().catch(() => null);
      if (!upstream.ok) {
        if ((!admin && [401, 403].includes(upstream.status)) || data?.code === "PT401") throw new HttpError(401, "登录已失效，请重新登录");
        throw new HttpError(502, "云端操作失败，请重试");
      }
      return data;
    };
    const rpc = (name, body) => call(`/rest/v1/rpc/${name}`, { method: "POST", body });
    const sessionUser = async token => {
      const user = await call("/auth/v1/user", { admin: false, accessToken: token });
      if (!user?.id) throw new HttpError(401, "请重新登录");
      return user;
    };
    try {
      const path = new URL(request.url, "http://localhost").pathname.replace(/\/$/, "");
      const management = /^\/api\/extension\/tokens\/([0-9a-f-]{36})$/i.exec(path);
      const methods = path === "/api/extension/token" ? ["POST"]
        : path === "/api/extension/tokens" ? ["GET"]
        : management ? ["DELETE"]
        : path === "/api/extension/me" ? ["GET"]
        : path === "/api/extension/library" ? ["GET", "PUT"] : null;
      if (!methods) throw new HttpError(404, "接口不存在");
      if (!methods.includes(request.method)) {
        response.setHeader("Allow", methods.join(", "));
        throw new HttpError(405, "不支持的请求方法");
      }
      const token = bearer(request);
      if (path === "/api/extension/token" || path === "/api/extension/tokens" || management) {
        const user = await sessionUser(token);
        if (path === "/api/extension/token") {
          const extensionToken = randomBytes(48).toString("base64url");
          await call("/rest/v1/extension_tokens", { method: "POST",
            body: { user_id: user.id, token_hash: hashToken(extensionToken) } });
          return response.status(200).json({ token: extensionToken });
        }
        if (management) {
          const rows = await call(`/rest/v1/extension_tokens?id=eq.${management[1]}&user_id=eq.${encodeURIComponent(user.id)}&revoked_at=is.null`, {
            method: "PATCH", body: { revoked_at: new Date().toISOString() },
          });
          if (!rows?.length) throw new HttpError(404, "连接不存在或已撤销");
          return response.status(204).end();
        }
        const tokens = await call(`/rest/v1/extension_tokens?user_id=eq.${encodeURIComponent(user.id)}&revoked_at=is.null&select=id,created_at,last_used_at&order=created_at.desc`);
        return response.status(200).json({ tokens });
      }

      const tokenHash = hashToken(token);
      const userId = await rpc("extension_authenticate", { p_token_hash: tokenHash });
      if (!userId) throw new HttpError(401, "扩展连接已失效，请重新登录");
      if (path === "/api/extension/me") {
        const result = await call(`/auth/v1/admin/users/${encodeURIComponent(userId)}`);
        const user = result?.user || result;
        if (!user?.id) throw new HttpError(401, "账号已不可用，请重新登录");
        return response.status(200).json({
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "PinPrompt 用户",
          email: user.email || "", avatar: user.user_metadata?.avatar_url || "",
        });
      }
      let body;
      if (request.method === "PUT") {
        if (Number(request.headers["content-length"]) > MAX_BODY_BYTES) throw new HttpError(413, "提示词库超过单次同步大小限制");
        try {
          const raw = request.body;
          const encoded = typeof raw === "string" || Buffer.isBuffer(raw) ? raw.toString() : JSON.stringify(raw);
          if (Buffer.byteLength(encoded || "") > MAX_BODY_BYTES) throw new HttpError(413, "提示词库超过单次同步大小限制");
          body = validateLibrary(JSON.parse(encoded));
        } catch (error) {
          if (error instanceof HttpError) throw error;
          throw new HttpError(400, "请求体必须是有效的 JSON 提示词库");
        }
      }
      const snapshot = await rpc("extension_library_snapshot", { p_user_id: userId });
      if (request.method === "GET") return response.status(200).json(exportLibrary(snapshot));
      const rows = importLibrary(body, snapshot, userId);
      await rpc("extension_replace_library", { p_user_id: userId, p_token_hash: tokenHash, p_prompts: rows.prompts, p_projects: rows.projects });
      return response.status(204).end();
    } catch (error) {
      response.status(error instanceof HttpError ? error.status : 500).json({
        error: error instanceof HttpError ? error.message : "扩展服务暂时不可用，请重试",
      });
    }
  };
}
