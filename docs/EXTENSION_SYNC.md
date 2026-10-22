# 拼好词 Chrome 扩展登录与同步

扩展 ID：`jchjipehcgipjchkgcdaejhdebeniieg`。不需要修改或重新发布扩展。

## 上线顺序

1. 在现有 Supabase 项目运行 `supabase/migrations/202610220001_extension_sync.sql`，或使用现有 Supabase CLI 的迁移流程。先迁移，再部署网站。
2. 在 Vercel 的 pinprompt 项目配置服务端变量：`SUPABASE_SECRET_KEY`（推荐的 Supabase secret key）或 `SUPABASE_SERVICE_ROLE_KEY`（兼容旧 service-role key）。必须属于现有项目 `zayfzpsrhxiaetrcttko`，不能加 `VITE_` 前缀。
3. `SUPABASE_URL` 和 `SUPABASE_PUBLISHABLE_KEY` 默认复用网站的现有配置；若网站使用其他项目，要同时检查客户端的 `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` 与服务端配置是否一致。
4. 部署此代码，再执行下方验收。前端仍是 Vite SPA，API 与 `/api/supabase` 一起运行于同一个 Vercel 项目的 Node Functions。

本地开发把服务端变量放在 `.env.local`，然后 `npm run dev`。Vite 仅在开发服务中加载扩展 API 的同一份 handler，密钥不会暴露给客户端。

## 数据与身份

工作台的实际结构是 `prompts(id, user_id, data)` 和 `projects(id, user_id, data)`，以 `(id, user_id)` 为冲突键；各业务字段保存在 `data` JSON 中。此次沿用同一份 JSON，不另建影子提示词库。

数据库迁移给两表增加独立 `ext_id` 列和 `(user_id, ext_id)` 唯一索引，并新建 `extension_tokens`。`no` / `source` 等扩展字段写入现有 `data` JSON，网站的缓存规范化同步保留这些字段。已有 `model` / `favorite` / `lastUsedAt` / `color` 等字段直接映射，不创建会与 JSON 内容分叉的重复字段。

| 扩展字段 | 网站字段 / 转换 |
| --- | --- |
| 提示词、项目 `id` | `ext_id` 原样保存；网页记录返回 `web_` + 数据库 `id` |
| `no` | 提示词 `data.no`，保留字符串及前导零 |
| `cat` | 提示词 `data.type`；兼容 img/vid/txt、中文等旧别名，无法映射的分类归 image |
| `title` / `model` / `source` | 提示词 `data` 同名字段 |
| `body` | 提示词 `data.content` |
| `fav` | 提示词 `data.favorite` |
| `createdAt` / `updatedAt` | 毫秒时间戳；兼容网站历史 ISO 时间字符串 |
| `usedAt` | 提示词 `data.lastUsedAt`；未使用返回 0 |
| 项目 `name` / `dot` | 项目 `data.name` / `data.color` |
| 项目 `items` | 与提示词 `data.projectIds` 相互转换，项目 `data.items` 保存顺序，内部引用数据库 ID |

扩展新条目获得服务端生成的数据库 ID，同时保留 `ext_id`，避免不同用户的扩展本地 ID 与数据库主键冲突。已有 `web_` ID 仅能定位当前用户已有行，找不到会返回 400，绝不新建同名记录或更新其他账号。

网页编辑时不写 `ext_id` 列，因此既有扩展 ID 保持稳定。网站专属的标签、说明、使用次数等元数据在扩展同步时保留。正文变更会清除过时的变量定义和版本正文，工作台按新正文重新识别变量。

`PUT` 先严格校验完整请求，然后一次数据库 RPC 事务执行项目/提示词 upsert 和不在请求中的条目删除。空数组也会清空库。所有删除与更新限定已鉴权的 `user_id`；写入前还会再次锁定并检查令牌的撤销状态。

网站把云端当作权威库：空云端库不会再触发旧缓存自动回填。回到浏览器标签页、重新聚焦页面以及每 30 秒会刷新云端数据；有本地保存请求时跳过刷新，避免覆盖当前编辑。没有增加离线编辑合并协议；多端并行修改沿用扩展的整体替换约定，最后提交的完整库生效。

## 路由与授权

- `/extension/auth?redirect_uri=...`：验证单个 `redirect_uri`，与 `src/lib/extension-auth.js` 中白名单进行完全一致匹配；不使用域名后缀匹配或 URL 归一化。缺失、重复或不一致均显示错误且不跳转。
- 未登录时在原地址复用现有邮箱登录/注册表单；不改路径及 query，刷新后仍可继续登录。账号必须经 Supabase 验证，本地缓存的账号不足以获得授权。
- 允许：用当前 Supabase access token 请求签发接口，跳转 `#token=`；取消（包括关闭登录）：跳转 `#error=access_denied`。接口失败原页显示重试。
- `/account/settings`：工作台头像菜单的「账号设置」可进入，列出未撤销连接及创建/使用时间，可逐条撤销。

## API

| 方法与路径 | Bearer 凭证 | 成功响应 |
| --- | --- | --- |
| POST `/api/extension/token` | Supabase access token | 200 `{ "token": "..." }` |
| GET `/api/extension/me` | 扩展令牌 | 200 `{ "name": "...", "email": "...", "avatar": "..." }` |
| GET `/api/extension/library` | 扩展令牌 | 200 `{ "prompts": [], "projects": [] }` |
| PUT `/api/extension/library` | 扩展令牌 | 204，无响应体 |
| GET `/api/extension/tokens` | Supabase access token | 200 `{ "tokens": [{ "id": "...", "created_at": "...", "last_used_at": null }] }` |
| DELETE `/api/extension/tokens/:id` | Supabase access token | 204，无响应体 |

错误均为 `{ "error": "..." }`。缺失、无效、已撤销凭证返回 401；请求字段非法返回 400；未知路径 404；不支持的方法 405；过大请求 413；未配置服务器密钥 503；云端失败 502。PUT 的应用大小限制为 4,000,000 字节，低于 Vercel Functions 的平台请求上限。

扩展令牌由 48 个随机字节生成，base64url 编码，无固定到期时间。服务器仅存储 SHA-256 哈希；仅签发响应返回明文，管理列表不含哈希。`extension_tokens` 开启 RLS，撤销浏览器角色的全部访问权限；三个 RPC 仅授予 `service_role` 执行权。接口不检查 Origin、不设置 Origin 白名单；不会把扩展令牌当作 Supabase 会话使用。所有扩展响应设置 `Cache-Control: no-store`，不记录令牌或上游敏感错误。

## 验证

```sh
npm test
npm run build
```

自动化测试覆盖 API handler 与字段转换、恶意回调、ID 稳定、账号隔离、拒绝令牌、撤销、错误处理和 JSX 静态渲染。HTTP 上游在这些测试中使用测试替身，不能取代真实数据库和扩展验收。

另有真实 PostgreSQL 事务/权限测试，在隔离的 Supabase 测试库迁移后执行（测试整体回滚）：

```sh
psql "$SUPABASE_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/extension_sync.sql
```

浏览器打开：

```text
https://pinprompt.art/extension/auth?redirect_uri=https%3A%2F%2Fjchjipehcgipjchkgcdaejhdebeniieg.chromiumapp.org%2Fauth
```

确认未登录 → 邮箱登录 → 原 query 保留 → 授权卡片 → 点击允许后跳到 chromiumapp.org 的 `#token=`。取消只返回 access_denied；无效 redirect_uri 不应跳转。

在本地终端安全设置 `PINPROMPT_EXTENSION_TOKEN` 后执行；不要把真实令牌提交到代码、文档或日志：

```sh
curl --fail-with-body -H "Authorization: Bearer $PINPROMPT_EXTENSION_TOKEN" https://pinprompt.art/api/extension/me
curl --fail-with-body -H "Authorization: Bearer $PINPROMPT_EXTENSION_TOKEN" https://pinprompt.art/api/extension/library
curl -i -H 'Authorization: Bearer invalid-token' https://pinprompt.art/api/extension/me
```

PUT 是整体替换，验收时先 GET 保存测试账号完整库，将一条新提示词加入 `prompts`（保留其余条目及 `projects`），保存到 `library.json`，再提交：

```sh
curl --fail-with-body -i -X PUT \
  -H "Authorization: Bearer $PINPROMPT_EXTENSION_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @library.json https://pinprompt.art/api/extension/library
```

在网站 `/studio` 验证新增内容、编号、项目颜色和归属。再从网站编辑同条内容，GET 验证其 ID 保持不变。最后在头像菜单 → 账号设置撤销连接，确认原令牌对 me/library（含 PUT）均返回 401。

## 当前验证边界

2026-10-22 已通过登录后的 Supabase SQL Editor，在项目 `zayfzpsrhxiaetrcttko` 完成迁移。迁移前已核对两表的 id 为 text、user_id 为 uuid、data 为 jsonb，联合主键为 (id, user_id)。真实数据库回滚、替换、账号隔离、网页编辑保留 ext_id、令牌撤销及浏览器角色权限测试均通过；测试事务已回滚，正式数据仍为 17 条提示词、4 个项目，扩展令牌为 0 条。

本地 21 项自动化测试及生产构建通过。当前终端不能联网、监听本地端口或启动测试浏览器；已改用连接的 Chrome 操作后台。Vercel 插件对现有团队返回 403；GitHub 插件能读取仓库但无法写入，已通过网页创建 `chrome-extension-sync-20261022` 发布分支（基于当前网站源码 `1bc92be`），并逐目录上传源码。

已将现有 Supabase `SUPABASE_SERVICE_ROLE_KEY` 以 Secret 保存到 Vercel pinprompt 项目的 Production 和 Preview 环境。密钥未写入源码。待完成：正式部署及 Chrome 扩展/API 联调。此状态记录不代表线上授权页面已更新；部署后必须执行真实端到端验收。
