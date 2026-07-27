import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CONTENT_ROOT = join(ROOT, "src/content");
export const TEMPLATE_ROOT = join(ROOT, "content-templates");
export const SITE_ORIGIN = "https://pinprompt.art";

export const TYPE_CONFIG = {
  "learning-path": { directory: "learning-paths", route: "learn", internalType: "learningPath" },
  knowledge: { directory: "knowledge", route: "knowledge", internalType: "knowledge" },
  workflow: { directory: "workflows", route: "workflows", internalType: "workflow" },
  tool: { directory: "tools", route: "tools", internalType: "tool" },
  frontier: { directory: "frontier", route: "frontier", internalType: "frontier" },
  template: { directory: "templates", route: "templates", internalType: "template" },
};

export const STATUS_VALUES = new Set(["draft", "published", "archived"]);
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function toProjectPath(filePath) {
  return relative(ROOT, filePath).split(sep).join("/");
}

export function walkMarkdown(directory = CONTENT_ROOT) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const filePath = join(directory, name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) return walkMarkdown(filePath);
    return name.endsWith(".md") ? [filePath] : [];
  });
}

export function parseMarkdownFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: source, source, error: "缺少YAML Frontmatter" };
  }

  try {
    return {
      data: YAML.parse(match[1]) || {},
      body: match[2] || "",
      source,
      error: "",
    };
  } catch (error) {
    return {
      data: {},
      body: match[2] || "",
      source,
      error: `Frontmatter解析失败：${error.message}`,
    };
  }
}

export function stringifyMarkdown(data, body) {
  return `---\n${YAML.stringify(data, { lineWidth: 0 }).trim()}\n---\n\n${String(body || "").trim()}\n`;
}

export function writeMarkdownFile(filePath, data, body) {
  writeFileSync(filePath, stringifyMarkdown(data, body), "utf8");
}

export function normalizeType(type) {
  if (type === "learningPath") return "learning-path";
  return TYPE_CONFIG[type] ? type : "";
}

export function routeFor(data) {
  const type = normalizeType(data.type);
  const config = TYPE_CONFIG[type];
  return config && data.slug ? `/${config.route}/${data.slug}` : "";
}

export function loadCatalogs() {
  const readJson = (fileName, fallback = []) => {
    try {
      return JSON.parse(readFileSync(join(CONTENT_ROOT, "catalog", fileName), "utf8"));
    } catch {
      return fallback;
    }
  };
  return {
    learningPaths: readJson("learningPaths.json"),
    modules: readJson("modules.json"),
  };
}

export function collectContentRecords() {
  const markdown = walkMarkdown().map((filePath) => {
    const parsed = parseMarkdownFile(filePath);
    return {
      ...parsed,
      filePath,
      projectPath: toProjectPath(filePath),
      normalizedType: normalizeType(parsed.data.type),
    };
  });
  const { learningPaths, modules } = loadCatalogs();
  return { markdown, learningPaths, modules };
}

export function findConflicts({ id, slug, type, exceptFile = "" }) {
  const normalizedType = normalizeType(type);
  const { markdown, learningPaths } = collectContentRecords();
  const records = [
    ...markdown
      .filter((item) => resolve(item.filePath) !== resolve(exceptFile || ROOT))
      .map((item) => ({ id: item.data.id, slug: item.data.slug, type: item.normalizedType, source: item.projectPath })),
    ...learningPaths.map((item) => ({
      id: item.id,
      slug: item.slug,
      type: "learning-path",
      source: "src/content/catalog/learningPaths.json",
    })),
  ];

  return {
    duplicateId: records.find((item) => item.id === id) || null,
    duplicateSlug: records.find((item) => item.type === normalizedType && item.slug === slug) || null,
  };
}

export function parseArgs(argv) {
  const result = { positional: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      result.positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) result[key] = true;
    else {
      result[key] = next;
      index += 1;
    }
  }
  return result;
}

export function ensureInsideContent(filePath) {
  const resolved = resolve(filePath);
  if (!resolved.startsWith(`${CONTENT_ROOT}${sep}`)) {
    throw new Error("只能操作 src/content 目录中的Markdown文件");
  }
  return resolved;
}

export function resolveContentFile(inputPath) {
  if (!inputPath) throw new Error("请提供内容文件路径");
  return ensureInsideContent(resolve(ROOT, inputPath));
}

export function assertPublishable(filePath, data, body) {
  const type = normalizeType(data.type);
  if (!TYPE_CONFIG[type]) throw new Error(`不支持的内容类型：${data.type || "未填写"}`);
  if (!data.id || !ID_PATTERN.test(String(data.id))) throw new Error("内容ID缺失或格式不正确");
  if (!data.slug || !SLUG_PATTERN.test(String(data.slug))) throw new Error("slug缺失或格式不正确");
  if (!data.title) throw new Error("请填写标题");
  if (!data.summary) throw new Error("正式发布前请填写summary");
  if (data.status === "archived") throw new Error("已归档内容不能直接发布，请先手动确认归档原因");
  if (/(?:TODO|待补充|示例正文)/i.test(body)) throw new Error("正文仍包含TODO、待补充或示例正文");
  if (!/^##\s+/m.test(body)) throw new Error("正式内容至少需要一个二级标题");

  const conflict = findConflicts({
    id: data.id,
    slug: data.slug,
    type,
    exceptFile: filePath,
  });
  if (conflict.duplicateId) throw new Error(`内容ID与 ${conflict.duplicateId.source} 冲突`);
  if (conflict.duplicateSlug) throw new Error(`slug与 ${conflict.duplicateSlug.source} 冲突`);

  const { markdown } = collectContentRecords();
  const ids = new Set(markdown.map((item) => item.data.id).filter(Boolean));
  const missingRelated = (Array.isArray(data.relatedIds) ? data.relatedIds : [])
    .filter((id) => !ids.has(id));
  if (missingRelated.length) throw new Error(`relatedIds不存在：${missingRelated.join(", ")}`);
}

export function replaceTemplateTokens(template, values) {
  return Object.entries(values).reduce(
    (content, [key, value]) => content.replaceAll(`{{${key}}}`, String(value ?? "")),
    template
  );
}
