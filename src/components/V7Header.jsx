import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/knowledge", label: "知识点" },
  { path: "/workflows", label: "工作流" },
  { path: "/tools", label: "工具" },
  { path: "/frontier", label: "前沿" },
  { path: "/templates", label: "提示词市集" },
];

export default function V7Header({ onStudioRequest }) {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  return (
    <header className="archive-nav-header">
      <div className="archive-nav-header__inner">
        <button className="archive-nav-brand" onClick={() => navigate("/")} type="button">
          <span aria-hidden="true">拼</span>
          <strong>
            <span>Pin<b>Prompt</b></span>
            <small>AIGC ARCHIVE · EST.2024</small>
          </strong>
        </button>

        <nav className="archive-nav-links" aria-label="主导航">
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

        <button className="archive-nav-studio" onClick={onStudioRequest} type="button">
          提示词工作台
        </button>
      </div>
    </header>
  );
}
