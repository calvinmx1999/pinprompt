function replaceVariables(content, values = {}) {
  return Object.entries(values).reduce((accumulator, [key, value]) => {
    if (value === undefined || value === null || value === "") return accumulator;
    return accumulator
      .replaceAll(`{${key}}`, String(value))
      .replaceAll(`{{${key}}}`, String(value));
  }, content || "");
}

function resolveBaseContent(prompt, platform) {
  const variant = (prompt?.variants || []).find((item) => item.platform === platform);
  return variant?.content || prompt?.content || "";
}

function defaultValue(values, key, fallback = `{${key}}`) {
  return values?.[key] ? String(values[key]) : fallback;
}

const PLATFORM_TEMPLATES = {
  "即梦": ({ content, values }) => `【即梦图片生成提示词】

主体：
${defaultValue(values, "subject")}

场景：
${defaultValue(values, "scene")}

风格：
${defaultValue(values, "style")}

画面要求：
${content}

补充要求：
真实质感，细节丰富，光影自然，避免过度磨皮和塑料感。`,

  "可灵": ({ content, values }) => `【可灵视频生成提示词】

视频时长：
${defaultValue(values, "duration")}

主场景：
${defaultValue(values, "scene")}

镜头运动：
${defaultValue(values, "camera")}

动作设计：
${defaultValue(values, "action")}

视频提示词：
${content}

要求：
动作连续，镜头自然，转场流畅，主体保持一致。`,

  Lovart: ({ content, values }) => `【Lovart 设计提示词】

设计目标：
围绕 ${defaultValue(values, "topic")} 生成一张视觉设计图。

品牌调性：
${defaultValue(values, "style")}

版式要求：
主体突出，层级清晰，预留标题和品牌信息区域。

具体内容：
${content}`,

  Liblib: ({ content, values }) => `【Liblib 图像生成提示词】

正向提示词：
${content}

风格词：
${defaultValue(values, "style")}

负面提示词：
低清晰度，畸形，错误手指，过度磨皮，塑料皮肤，文字错误，水印，logo错乱

建议参数：
画幅：${defaultValue(values, "aspectRatio")}
风格强度：中等`,

  Seedance: ({ content, values }) => `【Seedance 视频提示词】

时长：
${defaultValue(values, "duration")}

场景：
${defaultValue(values, "scene")}

镜头设计：
${defaultValue(values, "camera")}

动作内容：
${defaultValue(values, "action")}

完整视频提示词：
${content}

要求：
镜头衔接自然，运动流畅，画面有电影感，主体一致，不要出现明显变形。`,

  "Nano Banana": ({ content, values }) => `【Nano Banana 图片编辑提示词】

编辑目标：
${content}

保留要求：
保留原图主体身份、脸部结构、构图关系和真实质感。

修改重点：
${defaultValue(values, "editTarget")}

避免：
不要改变人物身份，不要过度商业化，不要塑料皮肤，不要失真。`,

  "GPT Image": ({ content, values }) => `【GPT Image 提示词】

任务：
${content}

需要保留：
主体结构、人物身份、主要构图、真实质感。

需要优化：
${defaultValue(values, "editTarget")}

风格：
${defaultValue(values, "style")}

输出要求：
画面自然，细节清晰，不要过度修饰。`,
};

export function adaptPromptToPlatform(prompt, platform, variables = {}) {
  const resolvedPlatform = platform && platform !== "通用版" ? platform : "通用版";
  const baseTemplate = resolveBaseContent(prompt, resolvedPlatform);
  const replaced = replaceVariables(baseTemplate, {
    ...Object.fromEntries((prompt?.variables || []).map((item) => [item.key, item.defaultValue || ""])),
    platform: resolvedPlatform,
    ...variables,
  });

  if (resolvedPlatform === "通用版") {
    return replaced;
  }

  const formatter = PLATFORM_TEMPLATES[resolvedPlatform];
  if (!formatter) {
    return replaced;
  }

  return formatter({
    prompt,
    platform: resolvedPlatform,
    content: replaced,
    values: {
      ...Object.fromEntries((prompt?.variables || []).map((item) => [item.key, item.defaultValue || ""])),
      platform: resolvedPlatform,
      ...variables,
    },
  });
}

export function buildPromptOutput(prompt, platform, variables = {}, mode = "adapted") {
  if (mode === "original") {
    return replaceVariables(resolveBaseContent(prompt, platform), variables);
  }
  return adaptPromptToPlatform(prompt, platform, variables);
}
