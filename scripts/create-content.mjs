import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  CONTENT_ROOT,
  ROOT,
  SITE_ORIGIN,
  SLUG_PATTERN,
  TEMPLATE_ROOT,
  TYPE_CONFIG,
  collectContentRecords,
  findConflicts,
  parseArgs,
  replaceTemplateTokens,
  routeFor,
  toProjectPath,
  today,
} from "./lib/content-files.mjs";

const args = parseArgs(process.argv.slice(2));
const interactive = Boolean(input.isTTY && output.isTTY);
const prompt = interactive ? createInterface({ input, output }) : null;

async function ask(label, fallback = "") {
  if (!prompt) return fallback;
  const suffix = fallback ? `（默认：${fallback}）` : "";
  return (await prompt.question(`${label}${suffix}：`)).trim() || fallback;
}

async function main() {
  try {
    const requestedType = String(args.type || await ask(
      `内容类型 ${Object.keys(TYPE_CONFIG).join(" / ")}`,
      "knowledge"
    ));
    const config = TYPE_CONFIG[requestedType];
    if (!config) throw new Error(`不支持的内容类型：${requestedType}`);

    const title = String(args.title || await ask("中文标题"));
    const slug = String(args.slug || await ask("英文slug"));
    if (!title) throw new Error("标题不能为空");
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error("slug只能包含小写英文、数字和连字符，且不能以连字符开头或结尾");
    }

    const category = String(args.category || await ask("内容分类", "未分类"));
    const moduleId = String(args.module || args["module-id"] || await ask("所属课程模块", ""));
    const level = String(args.level || await ask("难度", "入门"));
    const readTime = String(args["read-time"] || await ask("阅读时间", "5分钟"));
    const isDraft = args.published ? false : String(args.draft ?? await ask("是否保存为草稿 yes/no", "yes")).toLowerCase() !== "no";
    const status = isDraft ? "draft" : "published";
    const date = today();
    const idPrefix = requestedType.replaceAll("-", "_");
    const id = String(args.id || `${idPrefix}_${slug.replaceAll("-", "_")}_${Date.now().toString(36)}`);

    const conflict = findConflicts({ id, slug, type: requestedType });
    if (conflict.duplicateId) throw new Error(`内容ID已经存在于 ${conflict.duplicateId.source}`);
    if (conflict.duplicateSlug) throw new Error(`同类型slug已经存在于 ${conflict.duplicateSlug.source}`);

    const directory = join(CONTENT_ROOT, config.directory);
    mkdirSync(directory, { recursive: true });
    const filePath = join(directory, `${slug}.md`);
    if (existsSync(filePath)) throw new Error(`文件已经存在，未执行覆盖：${toProjectPath(filePath)}`);

    const templatePath = join(TEMPLATE_ROOT, `${requestedType}.md`);
    if (!existsSync(templatePath)) throw new Error(`找不到内容模板：${toProjectPath(templatePath)}`);
    const template = readFileSync(templatePath, "utf8");
    const content = replaceTemplateTokens(template, {
      ID: id,
      SLUG: slug,
      TYPE: requestedType,
      TITLE: title,
      SUMMARY: args.summary || "",
      CATEGORY: category,
      MODULE_ID: moduleId,
      LEVEL: level,
      READ_TIME: readTime,
      STATUS: status,
      PUBLISHED_AT: status === "published" ? date : "",
      UPDATED_AT: date,
      VERSION: "1.0",
    });
    writeFileSync(filePath, content, "utf8");

    if (args.assets) {
      mkdirSync(join(ROOT, "public/content-assets", config.directory, slug), { recursive: true });
    }

    const parsedType = requestedType;
    const route = routeFor({ type: parsedType, slug });
    console.log(`
内容已创建

文件：
${toProjectPath(filePath)}

预览地址：
http://localhost:5173${route}?preview=1

正式地址：
${SITE_ORIGIN}${route}

下一步：
1. 填写正文和Frontmatter
2. npm run content:check
3. npm run content:publish -- ${toProjectPath(filePath)}
`);
  } finally {
    prompt?.close();
  }
}

main().catch((error) => {
  console.error(`创建失败：${error.message}`);
  if (!interactive && (!args.type || !args.title || !args.slug)) {
    console.error("非交互环境请至少提供 --type、--title 和 --slug");
  }
  process.exitCode = 1;
});
