const FAVORITES_KEY = "pinprompt.contentFavorites";
const READING_HISTORY_KEY = "pinprompt.readingHistory";

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getContentFavoriteIds() {
  return readArray(FAVORITES_KEY).map(String);
}

export function isContentFavorite(itemId) {
  return getContentFavoriteIds().includes(String(itemId));
}

export function toggleContentFavorite(itemId) {
  const id = String(itemId);
  const current = getContentFavoriteIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getReadingHistory() {
  return readArray(READING_HISTORY_KEY)
    .filter((entry) => entry?.itemId && entry?.viewedAt)
    .sort((a, b) => String(b.viewedAt).localeCompare(String(a.viewedAt)))
    .slice(0, 50);
}

export function recordContentView(item) {
  if (!item?.id) return getReadingHistory();
  const entry = {
    itemId: item.id,
    type: item.type,
    slug: item.slug,
    viewedAt: new Date().toISOString(),
  };
  const next = [entry, ...getReadingHistory().filter((itemEntry) => itemEntry.itemId !== item.id)].slice(0, 50);
  localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(next));
  return next;
}
