import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CONTENT_TYPES,
  getContentTaxonomy,
  searchContent,
} from "../../lib/contentLoader.js";
import ContentCard from "./ContentCard.jsx";

const PAGE_COPY = {
  learningPath: ["学习路径", "按模块建立完整的 AIGC 知识框架。"],
  knowledge: ["知识点", "用短内容理解概念、方法和关键判断。"],
  workflow: ["工作流", "跟着步骤完成研究、创作和办公任务。"],
  tool: ["工具库", "快速了解工具适合什么、能做什么、有哪些限制。"],
  frontier: ["AI前沿", "理解正在发生的新概念，以及它与你的关系。"],
  template: ["提示词模板", "直接复制成熟结构，再按自己的任务修改。"],
  favorite: ["我的收藏", "保存值得继续阅读和直接使用的内容。"],
  search: ["搜索结果", "在标题、正文、工具和 Prompt 中查找内容。"],
};

export default function ContentListPage({
  favoriteIds,
  mode,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [tool, setTool] = useState("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("latest");

  const type = mode === "favorite" || mode === "search" ? "all" : mode;
  const allMatches = useMemo(
    () => searchContent(query, { category, sort, tag, tool, type }),
    [category, query, sort, tag, tool, type]
  );
  const items = mode === "favorite"
    ? allMatches.filter((item) => favoriteIds.includes(item.id))
    : allMatches;
  const taxonomy = useMemo(() => getContentTaxonomy(searchContent("", { type })), [type]);
  const [title, summary] = PAGE_COPY[mode] || PAGE_COPY.knowledge;

  function submitSearch(event) {
    event.preventDefault();
    if (mode === "search") {
      setSearchParams(query ? { q: query } : {});
    }
  }

  return (
    <section className="modular-list-page">
      <header className="modular-list-page__head">
        <div>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
        <span>{items.length} 条内容</span>
      </header>

      <form className="modular-search" onSubmit={submitSearch}>
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="搜索内容"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、正文、工具或Prompt..."
          value={query}
        />
        <button type="submit">搜索</button>
      </form>

      <div className="modular-filters">
        <label>
          <span>分类</span>
          <select onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="all">全部分类</option>
            {taxonomy.categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>工具</span>
          <select onChange={(event) => setTool(event.target.value)} value={tool}>
            <option value="all">全部工具</option>
            {taxonomy.tools.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>标签</span>
          <select onChange={(event) => setTag(event.target.value)} value={tag}>
            <option value="all">全部标签</option>
            {taxonomy.tags.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>排序</span>
          <select onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="latest">最新更新</option>
            <option value="oldest">最早发布</option>
          </select>
        </label>
      </div>

      {!items.length ? (
        <div className="modular-empty-state">
          <strong>{query ? "没有找到相关内容" : "这个栏目暂时还没有内容"}</strong>
          <p>{query ? "换一个关键词或清除筛选条件再试试。" : "新的内容发布后会自动显示在这里。"}</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("all");
              setTool("all");
              setTag("all");
            }}
            type="button"
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className="modular-content-grid">
          {items.map((item) => (
            <ContentCard
              favorite={favoriteIds.includes(item.id)}
              item={item}
              key={item.id}
              onNavigate={navigate}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
