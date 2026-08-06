import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/learn", label: "学习路径" },
  { path: "/knowledge", label: "知识点" },
  { path: "/workflows", label: "工作流" },
  { path: "/tools", label: "工具库" },
  { path: "/frontier", label: "AI前沿" },
  { path: "/templates", label: "提示词模板" },
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
  onLoginRequest,
  onLogout,
  onStudioRequest,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (location.pathname !== "/search") setQuery("");
  }, [location.pathname]);

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function submitSearch(event) {
    event.preventDefault();
    const keyword = query.trim();
    navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : "/search");
  }

  return (
    <header className="v7-header">
      <div className="v7-header__inner">
        <button className="v7-brand" onClick={() => navigate("/")} type="button">
          <BrandMark />
          <span className="v7-brand-copy">
            <strong><span>Pin</span><b>Prompt</b></strong>
            <small>AIGC 学习与提示词</small>
          </span>
        </button>

        <form className="v7-header-search" onSubmit={submitSearch}>
          <button aria-label="提交搜索" type="submit">⌕</button>
          <input
            aria-label="搜索知识、工作流、工具和提示词"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索知识、工作流、工具、提示词..."
            value={query}
          />
          <kbd>⌘K</kbd>
        </form>

        <nav className="v7-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <button
              className={isActive(item.path) ? "is-active" : ""}
              key={item.path}
              onClick={() => navigate(item.path)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {currentUser ? (
          <div className="v7-account">
            <button className="v7-studio-button" onClick={onStudioRequest} type="button">
              <span aria-hidden="true">✦</span>
              提示词工作台
            </button>
            <button className="v7-account__library" onClick={() => navigate("/favorites")} type="button">
              我的收藏
            </button>
            <button className="v7-account__trigger" onClick={() => navigate("/")} type="button">
              <span>{(currentUser.name || "学").slice(0, 1).toUpperCase()}</span>
              <b>{currentUser.name || "我的学习"}</b>
            </button>
            <button className="v7-account__logout" onClick={onLogout} type="button">退出</button>
          </div>
        ) : (
          <div className="v7-account v7-account--guest">
            <button className="v7-studio-button" onClick={onStudioRequest} type="button">
              <span aria-hidden="true">✦</span>
              提示词工作台
            </button>
            <button className="v7-account__library" onClick={() => navigate("/favorites")} type="button">
              我的收藏
            </button>
            <button className="v7-start-button" onClick={onLoginRequest} type="button">登录</button>
          </div>
        )}
      </div>
    </header>
  );
}
