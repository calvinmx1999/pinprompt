import seedContent from "../data/learningContent.json";

const FAVORITES_KEY = "pinprompt.learningFavorites";

export const LEARNING_TYPE_OPTIONS = [
  { id: "learningPath", label: "学习路径" },
  { id: "case", label: "实战案例" },
  { id: "article", label: "工具专栏" },
  { id: "template", label: "提示词模板" },
];

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeContentItem(item, favoriteIds = []) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary || "",
    direction: item.direction || "通用学习",
    scenario: item.scenario || "通用场景",
    tools: Array.isArray(item.tools) ? item.tools : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    level: item.level || "入门",
    duration: item.duration || "",
    featured: Boolean(item.featured),
    outcome: item.outcome || "",
    lessons: Array.isArray(item.lessons) ? item.lessons : [],
    steps: Array.isArray(item.steps) ? item.steps : [],
    practiceTasks: Array.isArray(item.practiceTasks) ? item.practiceTasks : [],
    commonMistakes: Array.isArray(item.commonMistakes) ? item.commonMistakes : [],
    fixTips: Array.isArray(item.fixTips) ? item.fixTips : [],
    articleSections: Array.isArray(item.articleSections) ? item.articleSections : [],
    prompt: item.prompt || "",
    favorite: favoriteIds.includes(item.id),
  };
}

function normalizeToolProfile(tool) {
  return {
    id: tool.id,
    name: tool.name || "未命名工具",
    category: tool.category || "AIGC 工具",
    bestFor: tool.bestFor || "",
    learningUse: tool.learningUse || "",
    goodAt: Array.isArray(tool.goodAt) ? tool.goodAt : [],
    limitations: Array.isArray(tool.limitations) ? tool.limitations : [],
  };
}

export function loadFavoriteIds() {
  return safeParse(FAVORITES_KEY, []);
}

export function saveFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(unique(ids)));
}

export function toggleFavoriteId(itemId) {
  const current = loadFavoriteIds();
  const next = current.includes(itemId)
    ? current.filter((id) => id !== itemId)
    : [...current, itemId];
  saveFavoriteIds(next);
  return next;
}

export function loadLearningItems() {
  const favoriteIds = loadFavoriteIds();
  return (seedContent.items || []).map((item) => normalizeContentItem(item, favoriteIds));
}

export function loadToolProfiles() {
  return (seedContent.tools || []).map(normalizeToolProfile);
}

export function getLearningTaxonomy(items) {
  return {
    directions: unique(items.map((item) => item.direction)),
    scenarios: unique(items.map((item) => item.scenario)),
    tools: unique(items.flatMap((item) => item.tools || [])),
  };
}

export function filterLearningItems(items, filters) {
  const {
    type = "all",
    query = "",
    direction = "all",
    scenario = "all",
    tool = "all",
    favoriteOnly = false,
  } = filters;

  const loweredQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (direction !== "all" && item.direction !== direction) return false;
    if (scenario !== "all" && item.scenario !== scenario) return false;
    if (tool !== "all" && !(item.tools || []).includes(tool)) return false;
    if (favoriteOnly && !item.favorite) return false;

    if (!loweredQuery) return true;

    const haystack = [
      item.title,
      item.summary,
      item.direction,
      item.scenario,
      ...(item.tools || []),
      ...(item.tags || []),
      ...(item.lessons || []),
      ...(item.practiceTasks || []),
      ...(item.fixTips || []),
      item.prompt,
      ...(item.articleSections || []).flatMap((section) => [section.title, section.content]),
      ...(item.steps || []).flatMap((step) => [step.title, step.description]),
      ...(item.commonMistakes || []).flatMap((entry) => [entry.problem, entry.fix]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(loweredQuery);
  });
}

export function getLearningCounts(items) {
  return {
    home: items.length,
    learningPaths: items.filter((item) => item.type === "learningPath").length,
    cases: items.filter((item) => item.type === "case").length,
    articles: items.filter((item) => item.type === "article").length,
    templates: items.filter((item) => item.type === "template").length,
    favorites: items.filter((item) => item.favorite).length,
  };
}

export function buildLearningPreview(text = "", maxLength = 92) {
  const compact = String(text).replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength)}...`;
}

export function favoriteBadgeText(item) {
  if (item.type === "learningPath") return `${item.duration || "持续学习"} · ${item.level}`;
  if (item.type === "case") return `${item.duration || "案例"} · ${item.level}`;
  if (item.type === "article") return `${item.duration || "阅读"} · ${item.tools?.[0] || "工具文"}`;
  return `${item.tools?.slice(0, 2).join(" / ") || "提示词"} · ${item.level}`;
}
