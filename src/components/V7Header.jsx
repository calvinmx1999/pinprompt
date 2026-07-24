const NAV_ITEMS = [
  { id: "home", label: "首页" },
  { id: "learningPaths", label: "系统课程" },
  { id: "cases", label: "实战教程" },
  { id: "articles", label: "工具指南" },
  { id: "templates", label: "提示词库" },
];

function BrandMark() {
  return (
    <span className="v7-brand-mark" aria-hidden="true">
      <span className="v7-brand-sheet v7-brand-sheet--pink">好</span>
      <span className="v7-brand-sheet v7-brand-sheet--yellow">词</span>
      <span className="v7-brand-sheet v7-brand-sheet--green">拼</span>
    </span>
  );
}

export default function V7Header({
  currentUser,
  currentView,
  onLoginRequest,
  onLogout,
  onSearch,
  onViewChange,
  searchQuery,
}) {
  const activeView =
    currentView === "pathDetail"
      ? "learningPaths"
      : currentView === "caseDetail"
        ? "cases"
        : currentView === "articleDetail"
          ? "articles"
          : currentView;

  return (
    <header className="v7-header">
      <div className="v7-header__inner">
        <button className="v7-brand" onClick={() => onViewChange("home")} type="button">
          <BrandMark />
          <span className="v7-brand-copy">
            <strong>
              <span>Pin</span>
              <b>Prompt</b>
            </strong>
            <small>AIGC 实战学习</small>
          </span>
        </button>

        <label className="v7-header-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="搜索课程、教程和提示词"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="搜索课程、案例、工具、提示词..."
            value={searchQuery}
          />
          <kbd>⌘K</kbd>
        </label>

        <nav className="v7-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <button
              className={activeView === item.id ? "is-active" : ""}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {currentUser ? (
          <div className="v7-account">
            <button className="v7-account__trigger" onClick={() => onViewChange("favorites")} type="button">
              <span>{(currentUser.name || "学").slice(0, 1).toUpperCase()}</span>
              <b>{currentUser.name || "我的学习"}</b>
            </button>
            <button className="v7-account__logout" onClick={onLogout} type="button">
              退出
            </button>
          </div>
        ) : (
          <button className="v7-start-button" onClick={onLoginRequest} type="button">
            开始学习
          </button>
        )}
      </div>
    </header>
  );
}
