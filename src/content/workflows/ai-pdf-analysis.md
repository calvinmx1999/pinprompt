---
id: workflow_pdf_001
slug: ai-pdf-analysis
type: workflow
title: 用AI快速分析一份PDF
summary: 从浏览结构到提取结论，完成一次可复核的长文档分析
category: 研究与办公
moduleId: module_llm
chapterId: chapter_ai_research
tags:
  - PDF
  - 文档分析
  - 研究
tools:
  - ChatGPT
level: 入门
readTime: 8分钟
cover: /v7-assets/v7-03-47ce5b3d68.webp
featured: true
status: published
publishedAt: 2026-07-27
updatedAt: 2026-07-27
version: "1.0"
relatedIds:
  - knowledge_prompt_001
  - tool_chatgpt_001
---

## 解决的问题

面对一份较长的报告，先快速理解结构，再定位关键结论和需要人工核对的内容。

## 准备事项

- 可复制文字的 PDF 文件
- 明确的阅读目标
- 能够上传文件并阅读文档的 AI 工具

## 操作步骤

1. 让 AI 列出文档目录、主题和各部分关系。
2. 指定你最关心的问题，要求标注依据所在页码。
3. 提取关键数字、结论和作者的限制条件。
4. 对重要结论回到原文逐项核对。

```prompt
请分析这份PDF。先概括文档结构，再围绕“{研究问题}”提取关键结论。
每条结论需要包含：原文依据、所在页码、可信度和需要进一步核对的地方。
不要补充文档中没有的信息。
```

## 常见问题

AI 可能遗漏图表中的信息，也可能给出错误页码。涉及决策的结论必须回到原文确认。
