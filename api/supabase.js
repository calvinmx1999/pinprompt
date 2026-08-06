const SUPABASE_ORIGIN =
  process.env.SUPABASE_URL || "https://zayfzpsrhxiaetrcttko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Z4b-LXyOAGf5rECj64ILZA_Pu-mTrIk";

const ALLOWED_PATHS = ["/auth/v1/", "/rest/v1/"];
const UPSTREAM_TIMEOUT_MS = 10000;

function targetUrl(request) {
  const path = String(request.query?.path || "");
  if (!ALLOWED_PATHS.some((prefix) => path.startsWith(prefix))) {
    throw new Error("unsupported_cloud_path");
  }
  return new URL(path, SUPABASE_ORIGIN);
}

function requestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  if (request.body == null) return undefined;
  return typeof request.body === "string" || Buffer.isBuffer(request.body)
    ? request.body
    : JSON.stringify(request.body);
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    const headers = {
      accept: request.headers.accept || "application/json",
      apikey: request.headers.apikey || SUPABASE_PUBLISHABLE_KEY,
      authorization:
        request.headers.authorization || `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "content-type": request.headers["content-type"] || "application/json",
      "x-client-info": request.headers["x-client-info"] || "pinprompt-web",
    };

    if (request.headers.prefer) headers.prefer = request.headers.prefer;

    const upstream = await fetch(targetUrl(request), {
      method: request.method,
      headers,
      body: requestBody(request),
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const contentType = upstream.headers.get("content-type");
    if (contentType) response.setHeader("Content-Type", contentType);

    const payload = await upstream.text();
    response.status(upstream.status);
    if (payload) {
      response.send(payload);
    } else {
      response.end();
    }
  } catch (error) {
    const unsupported = error?.message === "unsupported_cloud_path";
    response.status(unsupported ? 400 : 502).json({
      error: unsupported ? "unsupported_cloud_path" : "cloud_unavailable",
      message: unsupported
        ? "不支持的云端请求。"
        : "云端暂时无法连接，请稍后重试。",
    });
  }
}
