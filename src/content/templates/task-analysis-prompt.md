---
id: template_task_analysis_001
slug: task-analysis-prompt
type: template
title: 通用任务分析Prompt
summary: 在开始执行前，先让AI梳理目标、输入、限制和交付格式
category: 通用效率
moduleId: module_llm
chapterId: chapter_prompt_basic
tags:
  - 任务拆解
  - 通用模板
  - 规划
tools:
  - ChatGPT
level: 入门
readTime: 3分钟
cover: /v7-assets/v7-05-10c8163e75.webp
featured: true
status: published
publishedAt: 2026-07-27
updatedAt: 2026-07-27
version: "1.0"
relatedIds:
  - knowledge_prompt_001
  - workflow_pdf_001
---

## 使用场景

适合需求还不够清楚，或任务包含多个步骤时使用。

## 模板正文

```prompt
请先不要直接执行任务。

我的目标是：{目标}
已有材料：{材料}
限制条件：{限制}
期望交付：{输出格式}

请先完成以下分析：
1. 用一句话复述目标。
2. 列出仍然缺少的信息。
3. 给出执行步骤和每一步的产出。
4. 标出可能出错或需要人工确认的环节。
```

## 变量说明

- `{目标}`：最终希望解决的问题。
- `{材料}`：已经拥有的资料、数据或示例。
- `{限制}`：时间、字数、风格、合规等要求。
- `{输出格式}`：表格、清单、文章或其他交付形式。

## 使用建议

分析结果确认后，再让 AI 按步骤执行。复杂任务可以一次只执行一个步骤。
