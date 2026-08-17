import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getContentTaxonomy,
  searchContent,
} from "../../lib/contentLoader.js";
import ContentCard from "./ContentCard.jsx";

const PAGE_COPY = {
  learningPath: { code: "PATH VOL.01", eyebrow: "学习总目", title: "学习路径", summary: "按照模块建立完整的 AIGC 知识框架。", section: "PATH INDEX" },
  knowledge: { code: "DOSSIER VOL.01", eyebrow: "知识卷宗", title: "知识点卷宗", summary: "从一个问题开始，理解概念、方法和关键判断。", section: "SECTION 1.1" },
  workflow: { code: "HANDBOOK FLOW.01", eyebrow: "实战手册", title: "工作流手册", summary: "把复杂任务拆成可以逐项执行、检查和复核的步骤。", section: "FLOW INDEX" },
  tool: { code: "LEDGER TOOL.01", eyebrow: "工具台账", title: "工具索引", summary: "先了解适合场景、核心能力和限制，再选择工具。", section: "TOOL LEDGER" },
  frontier: { code: "CLIPPING F.01", eyebrow: "前沿剪报", title: "前沿剪报", summary: "解释正在发生的新概念，以及它为什么值得关注。", section: "LATEST CLIPPINGS" },
  template: { code: "MARKET VOL.01", eyebrow: "提示词市集", title: "提示词市集。", summary: "像调阅档案一样查找、收藏并直接使用成熟提示词结构。", section: "MARKET FILES" },
  favorite: { code: "PRIVATE FILES", eyebrow: "私人词库", title: "我的收藏", summary: "保存值得继续阅读和直接使用的内容。", section: "SAVED FILES" },
  search: { code: "ARCHIVE SEARCH", eyebrow: "全库检索", title: "搜索结果", summary: "在标题、正文、工具和 Prompt 中查找内容。", section: "SEARCH RESULT" },
};

export default function ContentListPage({ favoriteIds, mode, onToggleFavorite }) {
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
  const page = PAGE_COPY[mode] || PAGE_COPY.knowledge;

  function submitSearch(event) {
    event.preventDefault();
    if (mode === "search") setSearchParams(query ? { q: query } : {});
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setTool("all");
    setTag("all");
  }

  return (
    <section className={`archive-list-page archive-list-page--${mode}`}>
      <div className="archive-list-breadcrumb">
        <span>PINPROMPT ARCHIVE</span><i>/</i><span>{page.eyebrow}</span><i>/</i><b>VOL.01</b>
      </div>

      <header className="archive-list-hero">
        <span className="archive-list-hero__tab">{page.code}</span>
        <div>
          <small>[ {page.eyebrow} ]</small>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
        </div>
        <aside>
          <strong>{items.length}</strong>
          <span>篇内容在册</span>
        </aside>
        <footer>
          <span>分类 {taxonomy.categories.length || 0}</span>
          <span>工具 {taxonomy.tools.length || 0}</span>
          <span>标签 {taxonomy.tags.length || 0}</span>
          <b>● 持续更新</b>
        </footer>
      </header>

      <form className="archive-list-search" onSubmit={submitSearch}>
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="搜索内容"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="检索标题、正文、工具或 Prompt..."
          value={query}
        />
        <button type="submit">查阅</button>
      </form>

      <div className="archive-list-filters">
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
            <option value="latest">最新归档</option>
            <option value="oldest">最早归档</option>
          </select>
        </label>
      </div>

      <div className="archive-list-section-label">
        <strong>{page.section}</strong>
        <span>{String(items.length).padStart(3, "0")} 篇在册</span>
      </div>

      {!items.length ? (
        <div className="archive-list-empty">
          <small>[ EMPTY FILE ]</small>
          <strong>{query ? "没有找到相关档案" : "这个栏目暂时还没有内容"}</strong>
          <p>{query ? "换一个关键词或清除筛选条件再试试。" : "新的内容发布后会自动归档到这里。"}</p>
          <button onClick={clearFilters} type="button">清除筛选</button>
        </div>
      ) : (
        <div className={`archive-list-grid archive-list-grid--${mode}`}>
          {items.map((item, index) => (
            <ContentCard
              favorite={favoriteIds.includes(item.id)}
              index={index}
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
