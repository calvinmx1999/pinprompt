import assert from "node:assert/strict";
import { test } from "node:test";
import { createExtensionHandler, hashToken } from "../server/extension-api.js";
import { category, exportLibrary, importLibrary, validateLibrary } from "../server/extension-library.js";
import { extensionRedirect, EXTENSION_REDIRECT_ALLOWLIST } from "../src/lib/extension-auth.js";
import { loadPrompts, loadProjects, savePrompts, saveProjects } from "../src/lib/storage.js";

const OWNER = "00000000-0000-0000-0000-000000000001";
const OTHER = "00000000-0000-0000-0000-000000000002";
const CALLBACK = EXTENSION_REDIRECT_ALLOWLIST[0];
const prompt = (id = "pr_one") => ({ id, no: "007", cat: "video", title: "标题", model: "Seedance",
  body: "正文 {场景}", fav: false, source: "", createdAt: 1792411562000, updatedAt: 1792411562000, usedAt: 0 });
const project = () => ({ id: "pj_one", name: "城市宣传片", dot: "#E8508A", items: ["pr_one"], updatedAt: 1792411562000 });
const empty = () => ({ prompts: [], projects: [] });

test("回调只接受唯一、完全一致的白名单地址", () => {
  assert.equal(extensionRedirect(`?redirect_uri=${encodeURIComponent(CALLBACK)}&keep=1`), CALLBACK);
  for (const value of ["", `${CALLBACK}/`, `${CALLBACK}?a=1`, `${CALLBACK}#x`, CALLBACK.replace("https:", "http:"),
    CALLBACK.replace(".chromiumapp.org", ".chromiumapp.org.evil.test"), ` ${CALLBACK}`, "javascript:alert(1)",
    "https://evil.test", CALLBACK.replace("/auth", "/%61uth")]) {
    assert.equal(extensionRedirect(`?redirect_uri=${encodeURIComponent(value)}`), null);
  }
  assert.equal(extensionRedirect(`?redirect_uri=${encodeURIComponent(CALLBACK)}&redirect_uri=${encodeURIComponent(CALLBACK)}`), null);
  assert.equal(extensionRedirect(""), null);
});

test("扩展提示词/项目往返保留字符串 ID、编号、颜色、顺序和毫秒时间", () => {
  const p = prompt();
  p.source = "https://example.test/ref";
  const library = { prompts: [p, prompt("pr_two")], projects: [{ ...project(), items: ["pr_two", "pr_one"] }] };
  const rows = importLibrary(library, empty(), OWNER);
  assert.deepEqual(exportLibrary(rows), library);
  assert.notEqual(rows.prompts[0].id, "pr_one");
  assert.deepEqual(rows.prompts[0].data.projectIds, [rows.projects[0].id]);
  assert.deepEqual(importLibrary(library, rows, OWNER).prompts.map(p => p.id), rows.prompts.map(p => p.id));
});

test("网页 web_ ID 更新同一条数据库记录并保留网站专属字段", () => {
  const old = { prompts: [{ id: "database-id", ext_id: null, data: { title: "旧标题", type: "workflow", content: "旧正文",
    tips: "说明", taskTags: ["广告"], usedCount: 12, createdAt: "2026-01-01T00:00:00Z" } }], projects: [] };
  const data = exportLibrary(old);
  assert.equal(data.prompts[0].id, "web_database-id");
  assert.equal(data.prompts[0].cat, "image");
  assert.equal(typeof data.prompts[0].createdAt, "number");
  data.prompts[0].body = "已更新 {产品}";
  const rows = importLibrary(data, old, OWNER);
  assert.equal(rows.prompts[0].id, "database-id");
  assert.equal(rows.prompts[0].ext_id, null);
  assert.equal(rows.prompts[0].data.tips, "说明");
  assert.equal(rows.prompts[0].data.usedCount, 12);
  assert.deepEqual(rows.prompts[0].data.variants, []);
  assert.equal(exportLibrary(rows).prompts[0].id, "web_database-id");
  assert.throws(() => importLibrary({ prompts: [prompt("web_someone-elses-row")], projects: [] }, old, OWNER), /不存在/);
});

test("网页项目 ID 和有序提示词引用同步为数据库 ID", () => {
  const rows = { prompts: [{ id: "p1", data: { title: "一", type: "text", projectIds: ["j1"] } },
    { id: "p2", data: { title: "二", type: "image", projectIds: ["j1"] } }],
    projects: [{ id: "j1", data: { name: "项目", color: "#123456", items: ["p2", "p1"] } }] };
  const exported = exportLibrary(rows);
  assert.deepEqual(exported.projects[0].items, ["web_p2", "web_p1"]);
  const imported = importLibrary(exported, rows, OWNER);
  assert.equal(imported.projects[0].id, "j1");
  assert.deepEqual(imported.projects[0].data.items, ["p2", "p1"]);
  assert.deepEqual(imported.prompts[0].data.projectIds, ["j1"]);
});

test("网站规范化和缓存不会丢失扩展字段", () => {
  const cache = new Map();
  globalThis.localStorage = { getItem: key => cache.get(key) ?? null, setItem: (key, value) => cache.set(key, value) };
  const rows = importLibrary({ prompts: [{ ...prompt(), model: "", source: "来源", createdAt: 0 }], projects: [project()] }, empty(), OWNER);
  savePrompts(rows.prompts.map(p => p.data));
  saveProjects(rows.projects.map(p => p.data));
  const normalized = { prompts: rows.prompts.map((p, i) => ({ ...p, data: loadPrompts()[i] })),
    projects: rows.projects.map((p, i) => ({ ...p, data: loadProjects()[i] })) };
  const p = exportLibrary(normalized).prompts[0];
  assert.equal(p.no, "007");
  assert.equal(p.source, "来源");
  assert.equal(p.model, "");
  assert.equal(p.createdAt, 0);
  assert.equal(p.usedAt, 0);
  assert.deepEqual(exportLibrary(normalized).projects[0].items, ["pr_one"]);
  delete globalThis.localStorage;
});

test("分类做兼容映射，未知分类归到 image", () => {
  for (const [input, expected] of [["img", "image"], ["vid", "video"], ["文案", "text"], ["audio", "music"], ["workflow", "image"], ["other", "image"], ["__proto__", "image"]]) {
    assert.equal(category(input), expected);
  }
});

test("拒绝无效/重复 ID、丢失字段、错误时间戳和悬空项目引用", () => {
  for (const body of [null, {}, { prompts: [], projects: null },
    { prompts: [prompt(), prompt()], projects: [] },
    { prompts: [{ ...prompt(), no: 7 }], projects: [] },
    { prompts: [{ ...prompt(), fav: "false" }], projects: [] },
    { prompts: [{ ...prompt(), cat: "workflow" }], projects: [] },
    { prompts: [{ ...prompt(), updatedAt: "2026-10-22" }], projects: [] },
    { prompts: [], projects: [project()] },
    { prompts: [prompt()], projects: [{ ...project(), dot: "javascript:alert(1)" }] },
    { prompts: [prompt()], projects: [{ ...project(), items: ["pr_one", "pr_one"] }] }]) {
    assert.throws(() => validateLibrary(body), error => error.status === 400);
  }
  assert.deepEqual(validateLibrary(empty()), empty());
});

// HTTP boundary double. Auth/RPC calls are checked through the same fetch interface
// used in production. Actual PostgreSQL transaction/RLS tests are in supabase/tests.
function fixture() {
  const tokens = [];
  const libraries = new Map([[OWNER, empty()], [OTHER, empty()]]);
  const calls = [];
  const account = { id: OWNER, email: "creator@example.test", user_metadata: { name: "创作者", avatar_url: "https://example.test/a.png" } };
  let snapshotFailure = false;
  let revokeBeforeWrite = false;
  const fetchImpl = async (input, options) => {
    const url = new URL(input);
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ path: url.pathname, body, headers: options.headers });
    const ok = data => Response.json(data);
    if (url.pathname === "/auth/v1/user") {
      return options.headers.Authorization === "Bearer valid-session" ? ok(account) : Response.json({ error: "invalid" }, { status: 401 });
    }
    assert.equal(options.headers.apikey, "server-secret");
    if (url.pathname.startsWith("/auth/v1/admin/users/")) return ok(account);
    if (url.pathname === "/rest/v1/extension_tokens") {
      if (options.method === "POST") {
        tokens.push({ ...body, id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa", created_at: "2026-10-22T00:00:00Z", revoked_at: null, last_used_at: null });
        return ok([tokens.at(-1)]);
      }
      const owner = url.searchParams.get("user_id").slice(3);
      const selected = tokens.filter(t => t.user_id === owner && t.revoked_at === null);
      if (options.method === "PATCH") {
        const rows = selected.filter(t => `eq.${t.id}` === url.searchParams.get("id"));
        rows.forEach(t => { t.revoked_at = body.revoked_at; });
        return ok(rows);
      }
      return ok(selected.map(({ id, created_at, last_used_at }) => ({ id, created_at, last_used_at })));
    }
    if (url.pathname.endsWith("/extension_authenticate")) {
      const token = tokens.find(t => t.token_hash === body.p_token_hash && !t.revoked_at);
      if (token) token.last_used_at = "2026-10-22T01:00:00Z";
      return ok(token?.user_id || null);
    }
    if (url.pathname.endsWith("/extension_library_snapshot")) {
      if (snapshotFailure) return Response.json({ message: "sensitive upstream diagnostic" }, { status: 500 });
      return ok(libraries.get(body.p_user_id));
    }
    if (url.pathname.endsWith("/extension_replace_library")) {
      if (revokeBeforeWrite) return Response.json({ code: "PT401" }, { status: 401 });
      libraries.set(body.p_user_id, { prompts: body.p_prompts, projects: body.p_projects });
      return ok(null);
    }
    throw new Error(`Unexpected request ${url.pathname}`);
  };
  const handler = createExtensionHandler({ fetchImpl, config: () => ({ url: "https://cloud.test", publicKey: "public", secretKey: "server-secret" }) });
  const request = async (path, method = "GET", token, body, headers = {}) => {
    const response = { headers: {}, code: 200,
      setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.code = code; return this; },
      json(value) { this.body = value; }, end() { this.ended = true; } };
    await handler({ url: `/api/extension/${path}`, method, body,
      headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers } }, response);
    return response;
  };
  const mint = async () => (await request("token", "POST", "valid-session")).body.token;
  return { tokens, libraries, calls, request, mint,
    failSnapshot: () => { snapshotFailure = true; }, revokeDuringWrite: () => { revokeBeforeWrite = true; } };
}

test("签发高熵令牌，持久层只收到 SHA-256 哈希", async () => {
  const f = fixture();
  const token = await f.mint();
  assert.match(token, /^[A-Za-z0-9_-]{64}$/);
  assert.equal(f.tokens[0].token_hash, hashToken(token));
  assert.equal(f.tokens[0].user_id, OWNER);
  assert.equal(JSON.stringify(f.tokens).includes(token), false);
  assert.equal((await f.request("token", "POST", "bad-session")).code, 401);
});

test("me 返回账号信息、更新最近使用时间，并接受扩展 Origin", async () => {
  const f = fixture();
  const response = await f.request("me", "GET", await f.mint(), undefined,
    { origin: "chrome-extension://jchjipehcgipjchkgcdaejhdebeniieg" });
  assert.equal(response.code, 200);
  assert.deepEqual(response.body, { name: "创作者", email: "creator@example.test", avatar: "https://example.test/a.png" });
  assert.ok(f.tokens[0].last_used_at);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("新用户为空，PUT 整体替换后能从网站表快照读到同一份数据", async () => {
  const f = fixture();
  const token = await f.mint();
  assert.deepEqual((await f.request("library", "GET", token)).body, empty());
  const library = { prompts: [prompt()], projects: [project()] };
  const result = await f.request("library", "PUT", token, JSON.stringify(library));
  assert.equal(result.code, 204);
  assert.equal(result.body, undefined);
  assert.equal(f.libraries.get(OWNER).prompts[0].data.content, prompt().body);
  assert.deepEqual((await f.request("library", "GET", token)).body, library);
  assert.equal((await f.request("library", "PUT", token, empty())).code, 204);
  assert.deepEqual((await f.request("library", "GET", token)).body, empty());
  assert.deepEqual(f.libraries.get(OTHER), empty());
});

test("GET 网页记录的 web_ ID，PUT 会更新已有数据库行", async () => {
  const f = fixture();
  f.libraries.set(OWNER, { prompts: [{ id: "site-id", data: { title: "网站新建", content: "旧内容", type: "video" } }], projects: [] });
  const token = await f.mint();
  const library = (await f.request("library", "GET", token)).body;
  assert.equal(library.prompts[0].id, "web_site-id");
  library.prompts[0].body = "扩展编辑后的内容";
  assert.equal((await f.request("library", "PUT", token, library)).code, 204);
  const rows = f.libraries.get(OWNER).prompts;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "site-id");
  assert.equal(rows[0].data.content, "扩展编辑后的内容");
});

test("错误或缺失令牌统一返回 401 JSON，Supabase 会话不能冒充扩展令牌", async () => {
  const f = fixture();
  for (const path of ["me", "library"]) {
    for (const token of [undefined, "wrong", "valid-session"]) {
      const response = await f.request(path, "GET", token);
      assert.equal(response.code, 401);
      assert.equal(typeof response.body.error, "string");
    }
  }
});

test("账号只能列出/撤销自己的连接，撤销后旧令牌立即 401", async () => {
  const f = fixture();
  const token = await f.mint();
  f.tokens.push({ id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb", user_id: OTHER, revoked_at: null, token_hash: hashToken("other") });
  const listing = await f.request("tokens", "GET", "valid-session");
  assert.equal(listing.body.tokens.length, 1);
  assert.equal("token_hash" in listing.body.tokens[0], false);
  assert.equal((await f.request("tokens/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb", "DELETE", "valid-session")).code, 404);
  assert.equal((await f.request("tokens", "GET", token)).code, 401);
  assert.equal((await f.request(`tokens/${f.tokens[0].id}`, "DELETE", "valid-session")).code, 204);
  assert.equal((await f.request("me", "GET", token)).code, 401);
  assert.equal((await f.request("library", "PUT", token, empty())).code, 401);
});

test("拒绝畸形 JSON/请求体，失败不会调用整体替换", async () => {
  const f = fixture();
  const token = await f.mint();
  for (const body of ["not-json", "{}", { prompts: [prompt()], projects: [project(), project()] }]) {
    assert.equal((await f.request("library", "PUT", token, body)).code, 400);
  }
  assert.equal((await f.request("library", "PUT", token, empty(), { "content-length": "4000001" })).code, 413);
  assert.equal(f.calls.some(c => c.path.endsWith("/extension_replace_library")), false);
});

test("上游失败返回可重试错误且不泄漏诊断或令牌", async () => {
  const f = fixture();
  const token = await f.mint();
  f.failSnapshot();
  const response = await f.request("library", "GET", token);
  assert.equal(response.code, 502);
  assert.equal(JSON.stringify(response.body).includes("sensitive"), false);
  assert.equal(JSON.stringify(response.body).includes(token), false);
});

test("写入事务再次校验撤销状态，校验后被撤销仍返回 401", async () => {
  const f = fixture();
  const token = await f.mint();
  f.revokeDuringWrite();
  assert.equal((await f.request("library", "PUT", token, { prompts: [prompt()], projects: [] })).code, 401);
  assert.deepEqual(f.libraries.get(OWNER), empty());
});

test("未知接口/方法返回 JSON 404/405", async () => {
  const f = fixture();
  assert.equal((await f.request("missing")).code, 404);
  const response = await f.request("library", "POST");
  assert.equal(response.code, 405);
  assert.equal(response.headers.Allow, "GET, PUT");
});
