---
id: knowledge_framework_publish_test
slug: framework-content-publishing-test
type: knowledge
title: 框架测试：内容创建与发布
summary: 验证内容创建、检查和发布命令是否能够形成稳定流程
category: 框架测试
moduleId: module_llm
chapterId: ""
tags: []
tools:
  - ChatGPT
level: 入门
readTime: 3分钟
cover: ""
featured: false
status: published
publishedAt: 2026-07-27
updatedAt: 2026-07-27
lastReviewedAt: 2026-07-27
version: "1.0"
applicableVersions:
  - PinPrompt 内容框架 v1
changeSummary: 验证了创建、检查、发布和稳定链接流程
relatedIds:
  - knowledge_prompt_001
---

## 一句话理解

内容维护者可以通过统一命令创建文件、检查元数据并发布内容，不需要修改React组件。

## 为什么重要

统一流程可以避免重复slug、失效关联和草稿意外上线，让内容更新保持原URL不变。

## 核心知识

### 创建

使用 `npm run content:new` 生成规范文件。

### 检查

使用 `npm run content:check` 检查字段、关联和资源路径。

### 发布

使用发布命令更新状态和日期，随后再由维护者决定何时提交代码。

## 示例对比

### 常见写法

每次新增内容都手动复制旧文件，容易遗留错误字段。

### 优化写法

使用内容创建命令，让模板和目录保持一致。

## 可以直接使用

```prompt
请检查这篇内容的标题、摘要、关联内容与更新时间，并用清单列出发布前仍需处理的问题。
```

## 常见问题

如果需要更新正文，应保留原有 `id` 和 `slug`，只更新正文、版本和 `updatedAt`。

## 继续探索

继续阅读“什么是Prompt？”，了解可复制提示词模块的显示方式。
