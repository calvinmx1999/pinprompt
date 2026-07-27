---
id: knowledge_prompt_001
slug: what-is-prompt
type: knowledge
title: 什么是Prompt？
summary: 理解人与大模型沟通的基本方式，以及一条清晰提示词的组成
category: Prompt基础
moduleId: module_llm
chapterId: chapter_prompt_basic
tags:
  - Prompt
  - 大模型
  - 入门
tools:
  - ChatGPT
level: 入门
readTime: 5分钟
cover: /v7-assets/v7-09-47c35f6905.webp
featured: true
status: published
publishedAt: 2026-07-27
updatedAt: 2026-07-27
version: "1.0"
relatedIds:
  - knowledge_aigc_001
  - template_task_analysis_001
---

## 一句话理解

Prompt 是用户向 AI 描述任务、背景、限制条件和输出要求的方式。

## 一条清晰Prompt的结构

1. **任务**：希望 AI 完成什么。
2. **背景**：完成任务需要知道哪些信息。
3. **要求**：语气、长度、格式和不能出现的内容。
4. **输出**：最终结果应当如何组织。

```prompt
你是一名内容策划。请根据我提供的产品信息，输出3个短视频选题。
每个选题包含标题、核心观点和30秒内容结构。
语言直接，避免空泛口号。
```

## 常见问题

| 问题 | 修改方法 |
| --- | --- |
| 结果太空泛 | 补充目标用户和真实背景 |
| 格式不稳定 | 给出明确字段或示例 |
| 内容太长 | 指定字数和优先级 |

> AI 输出不理想时，不要急着更换模型，先检查背景信息和输出标准是否完整。
