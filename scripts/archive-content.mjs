import { existsSync } from "node:fs";
import {
  parseArgs,
  parseMarkdownFile,
  resolveContentFile,
  routeFor,
  toProjectPath,
  today,
  writeMarkdownFile,
} from "./lib/content-files.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = resolveContentFile(args.positional[0]);
  if (!existsSync(filePath)) throw new Error(`文件不存在：${toProjectPath(filePath)}`);
  const parsed = parseMarkdownFile(filePath);
  if (parsed.error) throw new Error(parsed.error);
  if (!parsed.data.id || !parsed.data.slug) throw new Error("内容缺少id或slug");

  const nextData = {
    ...parsed.data,
    status: "archived",
    updatedAt: today(),
    archiveReason: args.reason || parsed.data.archiveReason || "内容已经停止维护",
  };
  if (args.replacement) nextData.replacementId = args.replacement;
  writeMarkdownFile(filePath, nextData, parsed.body);

  console.log(`
内容已归档

文件：${toProjectPath(filePath)}
状态：archived
原链接：${routeFor(nextData)}
原因：${nextData.archiveReason}

原文件没有删除，收藏记录仍然安全。
`);
}

main().catch((error) => {
  console.error(`归档失败：${error.message}`);
  process.exitCode = 1;
});
