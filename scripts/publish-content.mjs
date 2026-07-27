import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SITE_ORIGIN,
  assertPublishable,
  parseArgs,
  parseMarkdownFile,
  resolveContentFile,
  routeFor,
  toProjectPath,
  today,
  writeMarkdownFile,
} from "./lib/content-files.mjs";
import { runValidation } from "./validate-content.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = resolveContentFile(args.positional[0]);
  if (!existsSync(filePath)) throw new Error(`文件不存在：${toProjectPath(filePath)}`);

  const parsed = parseMarkdownFile(filePath);
  if (parsed.error) throw new Error(parsed.error);
  assertPublishable(filePath, parsed.data, parsed.body);

  const date = today();
  const nextData = {
    ...parsed.data,
    status: "published",
    publishedAt: parsed.data.publishedAt || date,
    updatedAt: date,
  };
  writeMarkdownFile(filePath, nextData, parsed.body);

  const report = runValidation({ silent: true });
  if (report.errors.length) {
    writeMarkdownFile(filePath, parsed.data, parsed.body);
    throw new Error(`发布后的全站检查失败，已恢复原状态：${report.errors[0].message}`);
  }

  console.log(`
内容已准备发布

文件：${toProjectPath(filePath)}
状态：published
更新时间：${date}
正式地址：
${SITE_ORIGIN}${routeFor(nextData)}

下一步：
git add ${toProjectPath(filePath)}
git commit -m "Publish ${nextData.title}"
git push
`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`发布失败：${error.message}`);
    process.exitCode = 1;
  });
}
