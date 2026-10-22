import { randomUUID } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const categories = {
  image: "image", img: "image", picture: "image", 图片: "image", 图像: "image",
  video: "video", vid: "video", 视频: "video",
  text: "text", txt: "text", 文本: "text", 文案: "text",
  music: "music", audio: "music", 音乐: "music", 音频: "music",
};
export const category = value => {
  const key = String(value || "").toLowerCase();
  return Object.hasOwn(categories, key) ? categories[key] : "image";
};
const millis = value => {
  if (value == null || value === "") return 0;
  const result = typeof value === "number" ? value : /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  return Number.isSafeInteger(result) && result >= 0 ? result : 0;
};
const publicId = row => row.ext_id ?? `web_${row.id}`;

export function exportLibrary({ prompts = [], projects = [] }) {
  const promptIds = new Map(prompts.map(row => [String(row.id), publicId(row)]));
  return {
    prompts: prompts.map((row, index) => {
      const p = row.data || {};
      return {
        id: publicId(row), no: String(p.no ?? String(index + 1).padStart(3, "0")),
        cat: category(p.type || p.category), title: p.title || "", model: p.model ?? (p.platforms || []).join(" / "),
        body: p.content || "", fav: Boolean(p.favorite), source: p.source || "",
        createdAt: millis(p.createdAt), updatedAt: millis(p.updatedAt), usedAt: millis(p.lastUsedAt),
      };
    }),
    projects: projects.map(row => {
      const p = row.data || {};
      const members = prompts.filter(prompt => (prompt.data?.projectIds || [prompt.data?.projectId]).includes(String(row.id)))
        .map(prompt => String(prompt.id));
      const ordered = [...new Set([...(Array.isArray(p.items) ? p.items.filter(id => members.includes(id)) : []), ...members])];
      return { id: publicId(row), name: p.name || "", dot: p.color || "#E8508A",
        items: ordered.map(id => promptIds.get(id)), updatedAt: millis(p.updatedAt) };
    }),
  };
}

function fail(message) { throw new HttpError(400, message); }
function isObject(value) { return value && typeof value === "object" && !Array.isArray(value); }
function stringField(value, key, max = 1_000_000) {
  if (typeof value !== "string" || value.length > max) fail(`无效字段：${key}`);
}
function timestamp(value, key) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 8_640_000_000_000_000) fail(`无效时间戳：${key}`);
}

export function validateLibrary(body) {
  if (!isObject(body) || !Array.isArray(body.prompts) || !Array.isArray(body.projects)) fail("prompts 和 projects 必须是数组");
  const validateIds = list => {
    const ids = new Set();
    for (const item of list) {
      if (!isObject(item)) fail("库条目必须是对象");
      stringField(item.id, "id", 256);
      if (!item.id || ids.has(item.id)) fail("条目 id 不能为空或重复");
      ids.add(item.id);
    }
    return ids;
  };
  const promptIds = validateIds(body.prompts);
  validateIds(body.projects);
  for (const p of body.prompts) {
    for (const field of ["no", "title", "model", "body", "source"]) stringField(p[field], field);
    if (!["image", "video", "text", "music"].includes(p.cat) || typeof p.fav !== "boolean") fail("无效的分类或收藏状态");
    for (const field of ["createdAt", "updatedAt", "usedAt"]) timestamp(p[field], field);
  }
  for (const p of body.projects) {
    stringField(p.name, "name");
    if (!/^#[0-9a-f]{6}$/i.test(p.dot)) fail("项目颜色必须是六位十六进制颜色");
    timestamp(p.updatedAt, "updatedAt");
    if (!Array.isArray(p.items) || new Set(p.items).size !== p.items.length || p.items.some(id => !promptIds.has(id))) fail("项目引用了缺失或重复的提示词");
  }
  return body;
}

// Resolve identities only within the authenticated owner's snapshot. An incoming web_
// reference must already exist; it can never insert a row or address another owner.
function resolve(list, previous) {
  const byExternal = new Map(previous.filter(row => row.ext_id != null).map(row => [row.ext_id, row]));
  const byDatabase = new Map(previous.map(row => [String(row.id), row]));
  const seen = new Set();
  return list.map(item => {
    let row = byExternal.get(item.id);
    if (!row && item.id.startsWith("web_")) {
      row = byDatabase.get(item.id.slice(4));
      if (!row || row.ext_id != null) fail("网页条目不存在，请重新读取提示词库后同步");
    }
    const id = row ? String(row.id) : randomUUID();
    if (seen.has(id)) fail("多个条目指向同一条网页记录");
    seen.add(id);
    return { item, previous: row?.data || {}, id, ext_id: row ? row.ext_id ?? null : item.id };
  });
}

export function importLibrary(body, snapshot, userId) {
  validateLibrary(body);
  const prompts = resolve(body.prompts, snapshot.prompts || []);
  const projects = resolve(body.projects, snapshot.projects || []);
  const promptIds = new Map(prompts.map(p => [p.item.id, p.id]));
  return {
    prompts: prompts.map(({ item: p, previous, id, ext_id }) => ({
      id, user_id: userId, ext_id,
      data: { ...previous, id, userId, no: p.no, title: p.title, type: p.cat,
        model: p.model, content: p.body, favorite: p.fav, source: p.source,
        platforms: previous.model === p.model && previous.platforms?.length ? previous.platforms : (p.model ? [p.model] : []),
        createdAt: p.createdAt, updatedAt: p.updatedAt, lastUsedAt: p.usedAt,
        projectId: null, projectIds: projects.filter(project => project.item.items.includes(p.id)).map(project => project.id),
        // Re-infer variables/variants after a body edit rather than retaining stale text.
        variables: previous.content === p.body ? previous.variables || [] : [],
        variants: previous.content === p.body ? previous.variants || [] : [],
      },
    })),
    projects: projects.map(({ item: p, previous, id, ext_id }) => ({
      id, user_id: userId, ext_id,
      data: { ...previous, id, userId, name: p.name, color: p.dot,
        items: p.items.map(item => promptIds.get(item)), updatedAt: p.updatedAt,
        createdAt: previous.createdAt ?? p.updatedAt },
    })),
  };
}
