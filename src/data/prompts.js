const API_URL = "https://pinprompt.art/api/prompts";

const TYPE_ALIASES = {
  txt: "txt",
  text: "txt",
  文本: "txt",
  img: "img",
  image: "img",
  图片: "img",
  video: "vid",
  vid: "vid",
  视频: "vid",
};

const PREVIEW_BACKGROUNDS = {
  img: "#D7EFD7",
  vid: "#F7D9E6",
  txt: "#FFF0A5",
};

export const TYPE_LABELS = {
  img: "图片",
  vid: "视频",
  txt: "文本",
};

export const PLATFORM_URLS = {
  "Nano Banana": "https://aistudio.google.com/",
  Seedance: "https://jimeng.jianying.com/",
  Claude: "https://claude.ai/",
  Kling: "https://app.klingai.com/",
  Lovart: "https://lovart.ai/",
  "GPT-IMAGE-2": "https://chatgpt.com/",
  "gpt-image-2": "https://chatgpt.com/",
  即梦: "https://jimeng.jianying.com/",
};

function normalizeType(rawType) {
  if (!rawType) return "txt";
  return TYPE_ALIASES[String(rawType).trim()] || "txt";
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeVariables(value) {
  const list = ensureArray(value);
  return list
    .map((item, index) => {
      if (typeof item === "string") {
        const clean = item.replace(/[{}]/g, "").trim();
        return {
          key: clean || `VAR_${index + 1}`,
          label: clean || `变量 ${index + 1}`,
          placeholder: "",
        };
      }

      if (item && typeof item === "object") {
        const key = item.key || item.name || item.variable || `VAR_${index + 1}`;
        return {
          key,
          label: item.label || item.title || key,
          placeholder: item.placeholder || item.example || "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function buildPreview(content, fallback) {
  const source = fallback || content || "";
  return String(source).replace(/\s+/g, " ").slice(0, 110);
}

function pickPayloadList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.prompts)) return payload.prompts;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function tryParseSessionValue(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.access_token === "string") return parsed.access_token;
    if (typeof parsed?.currentSession?.access_token === "string") {
      return parsed.currentSession.access_token;
    }
  } catch {
    return null;
  }

  return null;
}

export function getAuthToken() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  const directKeys = [
    "pinprompt-auth-token",
    "authToken",
    "access_token",
    "token",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    if (!key.startsWith("sb-") && !key.includes("supabase")) continue;
    const token = tryParseSessionValue(window.localStorage.getItem(key));
    if (token) return token;
  }

  return null;
}

function normalizePrompt(item) {
  const type = normalizeType(item.type || item.content_type || item.category);
  const content = item.content || item.prompt || item.text || "";
  const title = item.title || item.name || "未命名提示词";
  const preview = buildPreview(content, item.preview || item.excerpt || item.summary);

  return {
    id: String(item.id || item.prompt_id || crypto.randomUUID()),
    title,
    type,
    platform: item.platform || item.model || item.provider || null,
    content,
    preview,
    variables: normalizeVariables(item.variables || item.params || item.placeholders),
    tags: ensureArray(item.tags || item.labels),
    useCount: Number(item.useCount || item.use_count || item.uses || 0),
    starred: Boolean(item.starred || item.is_starred || item.favorite || item.bookmarked),
    previewBg: item.previewBg || item.preview_bg || PREVIEW_BACKGROUNDS[type],
  };
}

export async function fetchPrompts() {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`提示词接口请求失败（${response.status}）`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("提示词接口返回了非 JSON 内容，请检查线上 API 配置。");
  }

  const payload = await response.json();
  return pickPayloadList(payload).map(normalizePrompt);
}
