const SUPABASE_ORIGIN =
  process.env.SUPABASE_URL || "https://zayfzpsrhxiaetrcttko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Z4b-LXyOAGf5rECj64ILZA_Pu-mTrIk";

function targetUrl(request) {
  const incoming = new URL(request.url, "https://pinprompt.art");
  const prefix = "/api/supabase";
  const pathname = incoming.pathname.startsWith(prefix)
    ? incoming.pathname.slice(prefix.length)
    : incoming.pathname;
  return new URL(`${pathname || "/"}${incoming.search}`, SUPABASE_ORIGIN);
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
    });

    const contentType = upstream.headers.get("content-type");
    if (contentType) response.setHeader("Content-Type", contentType);
    const location = upstream.headers.get("location");
    if (location) response.setHeader("Location", location);

    const payload = Buffer.from(await upstream.arrayBuffer());
    response.status(upstream.status).send(payload);
  } catch {
    response.status(502).json({
      error: "cloud_unavailable",
      message: "云端暂时无法连接，请稍后重试。",
    });
  }
}
