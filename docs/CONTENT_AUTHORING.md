# PinPrompt 内容创作与发布指南

PinPrompt 的学习内容由 Markdown 文件驱动。日常维护只需要完成“创建、编写、检查、发布”四步，不需要修改 React 页面。

## 1. 创建内容

交互式创建：

```bash
npm run content:new
```

参数式创建：

```bash
npm run content:new -- \
  --type knowledge \
  --title "什么是Prompt？" \
  --slug "what-is-prompt" \
  --category "Prompt基础" \
  --module module_llm \
  --level 入门 \
  --read-time 5分钟 \
  --assets
```

支持的类型：

- `learning-path`
- `knowledge`
- `workflow`
- `tool`
- `frontier`
- `template`

`slug` 只能使用小写英文、数字和连字符。命令不会覆盖同名文件，也会阻止重复 ID 和重复链接。

加上 `--assets` 会同时创建对应媒体目录。

## 2. 编写正文

### 标题和段落

```markdown
## 核心知识

这里是正文。

### 一个具体要点

这里是要点说明。
```

### Prompt 代码块

````markdown
```prompt
你是一名内容策划，请根据以下信息输出三条建议。
```
````

网站会把它显示成可复制的 Prompt 卡片。

### 图片

```markdown
![错误Prompt与优化Prompt对比](/content-assets/knowledge/what-is-prompt/example.webp)
```

图片会使用 alt 文字作为说明，并支持点击放大。不要使用本机绝对路径、`file://` 或 base64 图片。

### 表格

```markdown
| 问题 | 修改方法 |
| --- | --- |
| 内容空泛 | 增加背景信息 |
```

移动端表格可以横向滚动。

### 引用和重点提示

```markdown
> AI 输出不理想时，先检查背景信息和输出标准是否完整。
```

## 3. 本地预览

```bash
npm run dev
```

开发环境的内容工作台：

```text
http://localhost:5173/content-studio
```

草稿详情页需要带上：

```text
?preview=1
```

正式生产环境默认不能查看草稿，也不会显示内容工作台。

## 4. 检查内容

```bash
npm run content:check
```

错误会阻止构建，例如：

- 重复 ID 或 slug
- 关联内容不存在
- 正式内容缺少摘要
- 本地图片路径错误
- 前沿文章缺少来源

警告不会阻止构建，例如未发布草稿正文为空、模块中的后续章节尚未发布。

## 5. 发布内容

```bash
npm run content:publish -- src/content/knowledge/what-is-prompt.md
```

发布命令会：

1. 检查文件、Frontmatter、ID、slug 和关联内容；
2. 阻止仍含 `TODO`、`待补充` 或 `示例正文` 的内容；
3. 将状态改为 `published`；
4. 补充 `publishedAt`；
5. 更新 `updatedAt`；
6. 再次执行全站检查。

命令不会自动提交 Git，也不会自动部署。

## 6. 更新内容

更新正文时：

- 不要随意修改 `id`；
- 不要随意修改 `slug`；
- 更新 `updatedAt` 和 `lastReviewedAt`；
- 根据需要提升 `version`；
- 用 `changeSummary` 写一句普通读者能理解的更新说明；
- 工具发生变化时更新 `applicableVersions`。

`slug` 决定公开 URL。修改它会让旧链接失效，应当视为迁移操作，而不是普通编辑。

## 7. 归档内容

```bash
npm run content:archive -- \
  src/content/tools/old-tool.md \
  --reason "该工具已经停止维护" \
  --replacement tool_new_version
```

归档不会删除文件。内容会退出正式列表和搜索，但原链接仍会显示归档原因和替代内容。

## 8. 建立关联内容

```yaml
relatedIds:
  - knowledge_prompt_002
  - workflow_ai_research_001
```

这里填写的是稳定 `id`，不是标题或 URL。不存在的关联会被检查命令拦截。

## 9. 添加图片

推荐目录：

```text
public/content-assets/knowledge/what-is-prompt/
├── cover.webp
├── example-before.webp
└── example-after.webp
```

Frontmatter 封面：

```yaml
cover: /content-assets/knowledge/what-is-prompt/cover.webp
```

正文图片：

```markdown
![优化前后对比](/content-assets/knowledge/what-is-prompt/example-after.webp)
```

## 10. AI 前沿来源

```yaml
sources:
  - title: Genie 3：世界模型的新进展
    publisher: Google DeepMind
    url: https://example.com
    publishedAt: 2025-08-05
    accessedAt: 2026-07-27
```

正式发布的前沿文章必须至少包含一条有效来源。

## 11. 常见错误

- **重复 slug**：换一个稳定且有含义的英文 slug。
- **relatedIds 不存在**：检查被关联内容的 `id`，不要填写标题。
- **图片路径错误**：确认文件位于 `public/content-assets` 并以 `/content-assets/` 开头。
- **草稿意外发布**：保持 `status: draft`，发布前运行检查。
- **修改 slug 导致旧链接失效**：普通更新不要修改 slug。
- **前沿文章缺少来源**：在 `sources` 中补充标题、机构和有效 URL。
- **内容被归档后收藏仍存在**：这是正常行为，原链接会显示归档说明，不会白屏。
