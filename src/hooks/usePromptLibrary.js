import { useEffect, useMemo, useState } from "react";
import { fetchPrompts } from "../data/prompts.js";

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [starred, setStarred] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const nextPrompts = await fetchPrompts();
      setPrompts(nextPrompts);
      setStarred(new Set(nextPrompts.filter((prompt) => prompt.starred).map((prompt) => prompt.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "提示词加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchType = filter === "all" || p.type === filter;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.preview.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.includes(search));
      return matchType && matchSearch;
    });
  }, [filter, prompts, search]);

  const counts = useMemo(() => {
    const all = prompts.length;
    const img = prompts.filter((p) => p.type === "img").length;
    const vid = prompts.filter((p) => p.type === "vid").length;
    const txt = prompts.filter((p) => p.type === "txt").length;
    return { all, img, vid, txt };
  }, [prompts]);

  function toggleStar(id) {
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  }

  async function copyToClipboard(text, label, shouldToast = true) {
    try {
      await navigator.clipboard.writeText(text);
      if (shouldToast) {
        showToast(`已复制「${label}」`);
      }
    } catch {
      showToast("复制失败，请手动复制");
    }
  }

  return {
    prompts,
    filter, setFilter,
    search, setSearch,
    loading,
    error,
    refresh,
    filtered,
    counts,
    starred, toggleStar,
    toastMsg,
    copyToClipboard,
    showToast,
  };
}
