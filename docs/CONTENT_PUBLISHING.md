# PinPrompt 内容发布指南

PinPrompt 的公开学习内容存放在 `src/content`。保存 Markdown 文件后，内容会自动进入对应栏目，不需要修改页面组件。

## 内容目录

- `src/content/knowledge`：知识库文章
- `src/content/workflows`：工作流教程
- `src/content/tools`：工具说明与对比
- `src/content/frontier`：前沿观察
- `src/content/templates`：提示词模板
- `src/content/catalog`：学习路径与模块关系

## Frontmatter

每篇 Markdown 顶部使用 YAML frontmatter：

```yaml
---
id: knowledge-example
type: knowledge
slug: example
title: 示例标题
summary: 一句话摘要
status: published
featured: false
cover: /v7-assets/example.webp
tags:
  - 基础知识
tools:
  - ChatGPT
related:
  - another-content-id
publishedAt: 2026-07-27
updatedAt: 2026-07-27
---
```

`id` 和同类型下的 `slug` 必须唯一。`status: draft` 的内容不会出现在正式网站；本地开发时可在网址后添加 `?preview=1` 预览草稿。

## 提示词复制块

使用 `prompt` 代码块可生成带复制按钮的提示词区域：

````markdown
```prompt
请分析 {subject}，并给出清晰的行动建议。
```
````

普通代码块、表格、引用、列表、图片和提示说明会使用统一的文章样式渲染。

## 关联内容

`related` 填写其他内容的 `id`。详情页会优先展示指定内容；没有填写时，系统会按栏目和标签自动推荐。

## 发布检查

1. 确认 `id`、`slug`、`title`、`summary`、`status` 和 `type` 已填写。
2. 确认封面路径可访问。
3. 运行 `npm run build`。
4. 检查列表页、详情页、搜索、收藏和提示词复制。
