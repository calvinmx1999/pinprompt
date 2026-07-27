import YAML from "yaml";
import learningPathsCatalog from "../content/catalog/learningPaths.json";
import modulesCatalog from "../content/catalog/modules.json";

const markdownFiles = import.meta.glob("../content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "type",
  "title",
  "summary",
  "category",
  "tags",
  "tools",
  "level",
  "readTime",
  "cover",
  "featured",
  "status",
  "publishedAt",
  "updatedAt",
  "version",
  "relatedIds",
  "moduleId",
  "chapterId",
];

export const CONTENT_TYPES = {
  knowledge: {
    label: "知识点",
    listPath: "/knowledge",
  },
  workflow: {
    label: "工作流",
    listPath: "/workflows",
  },
  tool: {
    label: "工具",
    listPath: "/tools",
  },
  frontier: {
    label: "AI前沿",
    listPath: "/frontier",
  },
  template: {
    label: "提示词模板",
    listPath: "/templates",
  },
  learningPath: {
    label: "学习路径",
    listPath: "/learn",
  },
};

function warn(message, detail) {
  if (import.meta.env.DEV) {
    console.warn(`[PinPrompt Content] ${message}`, detail || "");
  }
}

function parseMarkdown(raw, filePath) {
  const source = String(raw || "");
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    warn("Frontmatter 缺失", filePath);
    return { data: {}, markdown: source };
  }

  try {
    return {
      data: YAML.parse(match[1]) || {},
      markdown: match[2] || "",
    };
  } catch (error) {
    warn("Frontmatter 解析失败", { filePath, error });
    return { data: {}, markdown: match[2] || "" };
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function normalizeContent(raw, filePath, index) {
  const { data, markdown } = parseMarkdown(raw, filePath);
  const folderType = filePath.split("/").at(-2)?.replace(/s$/, "");
  const type = CONTENT_TYPES[data.type] ? data.type : CONTENT_TYPES[folderType] ? folderType : "";

  const item = {
    id: String(data.id || `invalid_content_${index}`),
    slug: String(data.slug || filePath.split("/").pop()?.replace(/\.md$/, "") || `item-${index}`),
    type,
    title: String(data.title || "未命名内容"),
    summary: String(data.summary || ""),
    category: String(data.category || "未分类"),
    tags: normalizeArray(data.tags),
    tools: normalizeArray(data.tools),
    level: String(data.level || "入门"),
    readTime: String(data.readTime || ""),
    cover: String(data.cover || ""),
    featured: Boolean(data.featured),
    status: ["draft", "published", "archived"].includes(data.status) ? data.status : "draft",
    publishedAt: String(data.publishedAt || ""),
    updatedAt: String(data.updatedAt || data.publishedAt || ""),
    version: String(data.version || "1.0"),
    relatedIds: normalizeArray(data.relatedIds),
    moduleId: String(data.moduleId || ""),
    chapterId: String(data.chapterId || ""),
    markdown: String(markdown || "").trim(),
    sourcePath: filePath,
  };

  const missing = REQUIRED_FIELDS.filter((field) => data[field] === undefined);
  if (missing.length) warn(`字段缺失: ${missing.join(", ")}`, filePath);
  if (!CONTENT_TYPES[item.type] || item.type === "learningPath") warn("内容类型不正确", filePath);
  if (!item.markdown) warn("Markdown 正文为空", filePath);

  return item;
}

const parsedContent = Object.entries(markdownFiles).map(([filePath, raw], index) =>
  normalizeContent(raw, filePath, index)
);

const duplicateKey = new Set();
for (const item of parsedContent) {
  const key = `${item.type}:${item.slug}`;
  if (duplicateKey.has(key)) warn("发现重复 slug", key);
  duplicateKey.add(key);
}

function canPreviewDrafts() {
  if (import.meta.env.VITE_CONTENT_PREVIEW === "true") return true;
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

function visibleContent() {
  return parsedContent.filter((item) =>
    canPreviewDrafts() ? item.status !== "archived" : item.status === "published"
  );
}

function normalizePath(path, index) {
  return {
    ...path,
    id: String(path.id || `learning_path_${index}`),
    slug: String(path.slug || `path-${index}`),
    type: "learningPath",
    title: String(path.title || "未命名学习路径"),
    summary: String(path.summary || ""),
    category: String(path.category || "学习路径"),
    tags: normalizeArray(path.tags),
    tools: normalizeArray(path.tools),
    level: String(path.level || "入门"),
    readTime: String(path.readTime || `${path.moduleIds?.length || 0}个模块`),
    cover: String(path.cover || ""),
    featured: Boolean(path.featured),
    status: ["draft", "published", "archived"].includes(path.status) ? path.status : "draft",
    publishedAt: String(path.publishedAt || ""),
    updatedAt: String(path.updatedAt || ""),
    version: String(path.version || "1.0"),
    relatedIds: normalizeArray(path.relatedIds),
    moduleIds: normalizeArray(path.moduleIds),
    markdown: "",
  };
}

const learningPaths = learningPathsCatalog.map(normalizePath);
const modules = modulesCatalog.map((module, index) => ({
  ...module,
  id: String(module.id || `module_${index}`),
  pathId: String(module.pathId || ""),
  number: String(module.number || index + 1).padStart(2, "0"),
  title: String(module.title || `模块 ${index + 1}`),
  summary: String(module.summary || ""),
  status: ["draft", "published", "archived"].includes(module.status) ? module.status : "draft",
  chapterIds: normalizeArray(module.chapterIds),
}));

function visiblePaths() {
  return learningPaths.filter((item) =>
    canPreviewDrafts() ? item.status !== "archived" : item.status === "published"
  );
}

export function getContentUrl(item) {
  if (!item) return "/";
  if (item.type === "learningPath") return `/learn/${item.slug}`;
  const config = CONTENT_TYPES[item.type];
  return config ? `${config.listPath}/${item.slug}` : "/";
}

export function getAllContent() {
  return [...visiblePaths(), ...visibleContent()];
}

export function getContentByType(type) {
  if (type === "learningPath") return visiblePaths();
  return visibleContent().filter((item) => item.type === type);
}

export function getContentBySlug(type, slug) {
  return getContentByType(type).find((item) => item.slug === slug) || null;
}

export function getContentById(id) {
  return getAllContent().find((item) => item.id === id) || null;
}

export function getFeaturedContent(type, limit = 4) {
  return getContentByType(type).filter((item) => item.featured).slice(0, limit);
}

export function getRelatedContent(item, limit = 4) {
  if (!item) return [];
  const all = getAllContent();
  const explicit = item.relatedIds
    .map((id) => all.find((candidate) => candidate.id === id))
    .filter(Boolean);
  const fallback = all.filter(
    (candidate) =>
      candidate.id !== item.id &&
      !explicit.some((related) => related.id === candidate.id) &&
      (candidate.type === item.type ||
        (item.moduleId && candidate.moduleId === item.moduleId) ||
        candidate.tags.some((tag) => item.tags.includes(tag)))
  );
  return [...explicit, ...fallback].slice(0, limit);
}

export function getAdjacentContent(item) {
  if (!item) return { previous: null, next: null };
  const candidates = getContentByType(item.type).filter(
    (candidate) => !item.moduleId || candidate.moduleId === item.moduleId
  );
  const index = candidates.findIndex((candidate) => candidate.id === item.id);
  return {
    previous: index > 0 ? candidates[index - 1] : null,
    next: index >= 0 && index < candidates.length - 1 ? candidates[index + 1] : null,
  };
}

export function searchContent(query, filters = {}) {
  const keyword = String(query || "").trim().toLowerCase();
  const items = getAllContent().filter((item) => {
    if (filters.type && filters.type !== "all" && item.type !== filters.type) return false;
    if (filters.category && filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.tool && filters.tool !== "all" && !item.tools.includes(filters.tool)) return false;
    if (filters.tag && filters.tag !== "all" && !item.tags.includes(filters.tag)) return false;
    if (!keyword) return true;
    return [
      item.title,
      item.summary,
      item.category,
      item.markdown,
      ...item.tags,
      ...item.tools,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  const direction = filters.sort === "oldest" ? 1 : -1;
  return items.sort((a, b) => direction * String(a.updatedAt).localeCompare(String(b.updatedAt)));
}

export function getLearningPaths() {
  return visiblePaths();
}

export function getModulesByPath(pathId) {
  const path = visiblePaths().find((item) => item.id === pathId);
  if (!path) return [];
  return path.moduleIds
    .map((moduleId) => modules.find((module) => module.id === moduleId))
    .filter((module) => module && (canPreviewDrafts() ? module.status !== "archived" : module.status === "published"));
}

export function getKnowledgeByModule(moduleId) {
  return getContentByType("knowledge").filter((item) => item.moduleId === moduleId);
}

export function getContentTaxonomy(items = getAllContent()) {
  return {
    categories: Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(),
    tags: Array.from(new Set(items.flatMap((item) => item.tags))).sort(),
    tools: Array.from(new Set(items.flatMap((item) => item.tools))).sort(),
  };
}
