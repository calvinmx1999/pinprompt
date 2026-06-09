import { useMemo, useState } from "react";
import PromptCard from "./components/PromptCard.jsx";
import Toast from "./components/Toast.jsx";
import UseModal from "./components/UseModal.jsx";
import { TYPE_LABELS } from "./data/prompts.js";
import { usePromptLibrary } from "./hooks/usePromptLibrary.js";

const FILTER_TABS = [
  { key: "all", label: (counts) => `全部 ${counts.all}` },
  { key: "txt", label: (counts) => `${TYPE_LABELS.txt} ${counts.txt}` },
  { key: "img", label: (counts) => `${TYPE_LABELS.img} ${counts.img}` },
  { key: "vid", label: (counts) => `${TYPE_LABELS.vid} ${counts.vid}` },
];

const TOP_NAV_ITEMS = ["产品", "模板", "工作流", "路线图", "案例"];
const SIDEBAR_ITEMS = [
  { label: "提示词库", count: 10, active: true },
  { label: "项目", count: 3 },
  { label: "收藏夹", count: 4 },
  { label: "最近使用", count: 2 },
];

const PROJECTS = [
  { name: "蒙娜丽莎织锦AI短片", count: 2, color: "#ea4d99" },
  { name: "国泰基金五一AI短片", count: 0, color: "#fa4c4c" },
  { name: "渝ba", count: 0, color: "#f6a10c" },
];

export default function App() {
  const {
    filter,
    setFilter,
    search,
    setSearch,
    prompts,
    filtered,
    counts,
    loading,
    error,
    refresh,
    starred,
    toggleStar,
    toastMsg,
    copyToClipboard,
    showToast,
  } = usePromptLibrary();
  const [activePrompt, setActivePrompt] = useState(null);

  const totalLabel = useMemo(() => `全部卡片 · ${counts.all} 条`, [counts.all]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span>拼</span>
          </div>
          <div className="brand-copy">
            <h1>
              <span>Pin</span>
              <span>Prompt</span>
            </h1>
            <p>提示词灵感库</p>
          </div>
        </div>

        <label className="sidebar-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索提示词或项目"
          />
        </label>

        <div className="sidebar-section-title">导航</div>
        <div className="nav-list">
          {SIDEBAR_ITEMS.map((item) => (
            <div className={`nav-item${item.active ? " active" : ""}`} key={item.label}>
              <strong>{item.label}</strong>
              <small>{item.count}</small>
            </div>
          ))}
        </div>

        <div className="sidebar-section-title">项目</div>
        <div className="project-list">
          {PROJECTS.map((project) => (
            <div className="project-item" key={project.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: project.color,
                    flexShrink: 0,
                  }}
                />
                <strong
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#8b8f9c",
                    fontWeight: 600,
                  }}
                >
                  {project.name}
                </strong>
              </div>
              <small style={{ background: "transparent" }}>{project.count}</small>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button className="sidebar-btn">导入/导出</button>
            <button className="sidebar-btn" aria-label="刷新">
              ↻
            </button>
          </div>
          <div className="profile-card">
            <div className="profile-avatar">用</div>
            <div>
              <strong>982622401</strong>
              <span>已同步</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <nav className="topbar-nav" aria-label="主导航">
            {TOP_NAV_ITEMS.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </nav>
        </header>

        <div className="content">
          <div className="content-inner">
            <div className="content-head">
              <div className="content-head-left">
                <h2>提示词库</h2>
                <button className="new-btn" type="button">
                  ＋ 新建提示词
                </button>
              </div>
            </div>

            <section className="filter-panel">
              <div className="toolbar-row">
                <label className="search-box">
                  <span style={{ color: "#bbb" }}>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索提示词…"
                  />
                  {search ? (
                    <button
                      aria-label="清空搜索"
                      onClick={() => setSearch("")}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "#bbb",
                        cursor: "pointer",
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  ) : null}
                </label>

                <div className="tabs">
                  {FILTER_TABS.map((tab) => (
                    <button
                      className={`tab-btn${filter === tab.key ? " active" : ""}`}
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      type="button"
                    >
                      {tab.label(counts)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="status-row">
              <span>{loading ? "正在同步提示词..." : totalLabel}</span>
              <span>{prompts.length > 0 ? "主内容区域已接入新组件" : "等待加载"}</span>
            </div>

            {error ? (
              <div className="error-state">
                <div>{error}</div>
                <button onClick={refresh} type="button">
                  重新获取
                </button>
              </div>
            ) : null}

            {!error && loading ? (
              <div className="empty-state">正在从 PinPrompt API 拉取真实提示词...</div>
            ) : null}

            {!error && !loading && filtered.length === 0 ? (
              <div className="empty-state">
                没有找到相关提示词
                <br />
                <button onClick={() => setSearch("")} type="button">
                  清空搜索
                </button>
              </div>
            ) : null}

            {!error && !loading && filtered.length > 0 ? (
              <div className="prompt-grid">
                {filtered.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isStarred={starred.has(prompt.id)}
                    onToggleStar={toggleStar}
                    onCopy={(content, title) => copyToClipboard(content, title)}
                    onUse={(promptItem) => setActivePrompt(promptItem)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {activePrompt ? (
        <UseModal
          prompt={activePrompt}
          onClose={() => setActivePrompt(null)}
          onCopy={(_, title) => {
            showToast(`已复制「${title}」`);
          }}
        />
      ) : null}

      <Toast message={toastMsg} />
    </div>
  );
}
