import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_ROOT,
  DATE_PATTERN,
  ID_PATTERN,
  ROOT,
  SLUG_PATTERN,
  STATUS_VALUES,
  TYPE_CONFIG,
  collectContentRecords,
  normalizeType,
  routeFor,
} from "./lib/content-files.mjs";

const REQUIRED_FIELDS = ["id", "slug", "type", "title", "summary", "status", "updatedAt"];
const CONTENT_PLACEHOLDERS = /(?:TODO|待补充|示例正文)/i;
const READ_TIME_PATTERN = /^\d+\s*(?:分钟|小时|个模块)$/;

function localAssetExists(url) {
  if (!url || /^https?:\/\//.test(url)) return true;
  if (!url.startsWith("/")) return false;
  return existsSync(join(ROOT, "public", url.slice(1)));
}

function entry(level, record, message) {
  return {
    level,
    file: record.projectPath || record.source || "内容目录",
    message,
  };
}

export function runValidation({ silent = false } = {}) {
  const { markdown, learningPaths, modules } = collectContentRecords();
  const errors = [];
  const warnings = [];
  let passed = 0;
  const add = (level, record, message) => {
    (level === "error" ? errors : warnings).push(entry(level, record, message));
  };

  const records = markdown.map((record) => ({
    ...record,
    id: record.data.id,
    slug: record.data.slug,
    type: record.normalizedType,
    status: record.data.status,
  }));
  const allIds = new Set([
    ...records.map((record) => record.id).filter(Boolean),
    ...learningPaths.map((item) => item.id).filter(Boolean),
  ]);
  const moduleIds = new Set(modules.map((item) => item.id));
  const chapterIds = new Set(records.map((item) => item.data.chapterId).filter(Boolean));
  const toolTitles = new Set(records.filter((item) => item.type === "tool").map((item) => item.data.title));
  const seenIds = new Map();
  const seenRoutes = new Map();

  for (const record of records) {
    const data = record.data;
    if (record.error) add("error", record, record.error);

    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null || String(data[field]).trim() === "") {
        add("error", record, `缺少基础字段：${field}`);
      } else passed += 1;
    }

    if (!TYPE_CONFIG[record.type]) add("error", record, `不支持的type：${data.type || "未填写"}`);
    else passed += 1;
    if (!STATUS_VALUES.has(data.status)) add("error", record, `status不合法：${data.status || "未填写"}`);
    else passed += 1;
    if (data.slug && !SLUG_PATTERN.test(String(data.slug))) add("error", record, `slug不合法：${data.slug}`);
    else if (data.slug) passed += 1;
    if (data.id && !ID_PATTERN.test(String(data.id))) add("error", record, `ID不合法：${data.id}`);
    else if (data.id) passed += 1;

    for (const field of ["publishedAt", "updatedAt", "lastReviewedAt"]) {
      if (data[field] && !DATE_PATTERN.test(String(data[field]))) {
        add("error", record, `${field}必须使用YYYY-MM-DD格式`);
      }
    }
    if (data.readTime && !READ_TIME_PATTERN.test(String(data.readTime))) {
      add("warning", record, `readTime格式可能不规范：${data.readTime}`);
    }
    if (data.publishedAt && data.updatedAt && data.updatedAt < data.publishedAt) {
      add("warning", record, "updatedAt早于publishedAt");
    }

    if (data.id) {
      if (seenIds.has(data.id)) add("error", record, `重复ID，同时存在于 ${seenIds.get(data.id)}`);
      else seenIds.set(data.id, record.projectPath);
    }
    const route = routeFor(data);
    if (route) {
      if (seenRoutes.has(route)) add("error", record, `重复正式链接，同时存在于 ${seenRoutes.get(route)}`);
      else seenRoutes.set(route, record.projectPath);
    }

    for (const relatedId of Array.isArray(data.relatedIds) ? data.relatedIds : []) {
      if (!allIds.has(relatedId)) add("error", record, `relatedIds引用不存在：${relatedId}`);
    }
    if (data.moduleId && !moduleIds.has(data.moduleId)) {
      add("error", record, `moduleId不存在：${data.moduleId}`);
    }
    if (data.chapterId && !modules.some((item) => item.chapterIds?.includes(data.chapterId))) {
      add("warning", record, `chapterId未被模块目录引用：${data.chapterId}`);
    }

    for (const tool of Array.isArray(data.tools) ? data.tools : []) {
      if (!toolTitles.has(tool)) add("warning", record, `关联工具未匹配工具文章：${tool}`);
    }

    const localReferences = [];
    if (data.cover) localReferences.push({ label: "封面", url: data.cover });
    if (data.videoCover) localReferences.push({ label: "视频封面", url: data.videoCover });
    if (data.video?.cover) localReferences.push({ label: "视频封面", url: data.video.cover });
    const imagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
    for (const match of record.body.matchAll(imagePattern)) {
      localReferences.push({ label: "Markdown图片", url: match[1] });
    }
    for (const reference of localReferences) {
      if (/^(?:file:\/\/|\/Users\/|[A-Za-z]:\\)/.test(reference.url)) {
        add("error", record, `${reference.label}不能引用开发机绝对路径：${reference.url}`);
      } else if (reference.url.startsWith("data:")) {
        add("error", record, `${reference.label}不能使用base64数据`);
      } else if (!localAssetExists(reference.url)) {
        add("error", record, `${reference.label}不存在：${reference.url}`);
      }
    }

    if (!record.body.trim()) {
      add(data.status === "published" ? "error" : "warning", record, "Markdown正文为空");
    }
    if (data.status === "published") {
      if (!data.summary) add("error", record, "已发布内容必须包含summary");
      if (CONTENT_PLACEHOLDERS.test(record.body)) add("error", record, "已发布正文仍包含TODO、待补充或示例正文");
      if (!/^##\s+/m.test(record.body)) add("error", record, "已发布正文没有二级标题");
    }
    if (record.type === "frontier") {
      const sources = Array.isArray(data.sources) ? data.sources : [];
      if (!sources.length) {
        add(data.status === "published" ? "error" : "warning", record, "AI前沿内容缺少参考来源");
      }
      for (const source of sources) {
        if (!source.title || !source.publisher || !/^https?:\/\//.test(source.url || "")) {
          add("error", record, "AI前沿来源必须包含标题、发布机构和有效外部URL");
        }
      }
    }
    if (record.type === "tool" && !(Array.isArray(data.applicableVersions) && data.applicableVersions.length)) {
      add("warning", record, "工具文章缺少applicableVersions适用版本");
    }
  }

  for (const path of learningPaths) {
    const source = { source: "src/content/catalog/learningPaths.json" };
    if (path.id) {
      if (seenIds.has(path.id)) add("error", source, `学习路径ID重复：${path.id}`);
      else seenIds.set(path.id, source.source);
    }
    for (const moduleId of path.moduleIds || []) {
      if (!moduleIds.has(moduleId)) add("error", source, `学习路径引用了不存在的模块：${moduleId}`);
    }
  }

  for (const module of modules) {
    const source = { source: "src/content/catalog/modules.json" };
    if (!learningPaths.some((path) => path.id === module.pathId)) {
      add("error", source, `模块 ${module.id} 的pathId不存在：${module.pathId}`);
    }
    for (const chapterId of module.chapterIds || []) {
      if (!chapterIds.has(chapterId)) add("warning", source, `章节尚无内容：${chapterId}`);
    }
  }

  const report = { errors, warnings, passed };
  if (!silent) {
    console.log("\nPinPrompt内容检查\n");
    console.log(`✓ 通过：${passed}项`);
    console.log(`⚠ 警告：${warnings.length}项`);
    console.log(`✕ 错误：${errors.length}项`);
    if (errors.length) {
      console.log("\n错误：");
      for (const item of errors) console.log(`${item.file}\n  ${item.message}`);
    }
    if (warnings.length) {
      console.log("\n警告：");
      for (const item of warnings) console.log(`${item.file}\n  ${item.message}`);
    }
    console.log("");
  }
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = runValidation();
  if (report.errors.length) process.exitCode = 1;
}
