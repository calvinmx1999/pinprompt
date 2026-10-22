import { getSupabase } from "./cloud.js";

export async function extensionAccountRequest(path, options = {}) {
  const { data, error } = await getSupabase().auth.getSession();
  if (error || !data.session?.access_token) throw new Error("登录已失效，请重新登录后重试");
  let response;
  try {
    response = await fetch(`/api/extension/${path}`, {
      ...options, headers: { Authorization: `Bearer ${data.session.access_token}` },
      signal: AbortSignal.timeout(20000), cache: "no-store",
    });
  } catch { throw new Error("网络连接失败，请重试"); }
  if (response.status === 204) return null;
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "扩展服务暂时不可用，请重试");
  return result;
}
