export default function PromptSidebar({
  currentUser,
  currentView,
  onViewChange,
  onCreateProject,
  onExport,
  onImport,
  onLogout,
  projects,
  selectedProjectId,
  onProjectSelect,
  promptCounts,
}) {
  const navItems = [
    { id: "library", label: "提示词库", count: promptCounts.all },
    { id: "assembler", label: "拼装器", count: promptCounts.fragments ?? 0 },
    { id: "workflows", label: "工作流", count: promptCounts.workflows ?? 0 },
    { id: "projects", label: "项目", count: projects.length },
    { id: "favorites", label: "收藏夹", count: promptCounts.favorites },
    { id: "recent", label: "最近使用", count: promptCounts.recent },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-stack">
          <span className="brand-card brand-card--back-pink" />
          <span className="brand-card brand-card--back-yellow" />
          <span className="brand-card brand-card--front">拼</span>
        </div>
        <div className="brand-copy">
          <div className="brand-copy__title">
            <span>Pin</span>
            <span>Prompt</span>
          </div>
          <div className="brand-copy__sub">提示词灵感库</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section__label">导航</div>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              className={`sidebar-nav__item${currentView === item.id ? " is-active" : ""}`}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section sidebar-section--grow">
        <div className="sidebar-section__label sidebar-section__label--row">
          <span>项目</span>
          <button onClick={onCreateProject} type="button">
            ＋
          </button>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <button
              className={`project-list__item${selectedProjectId === project.id ? " is-selected" : ""}`}
              key={project.id}
              onClick={() => {
                onViewChange("projects");
                onProjectSelect(project.id);
              }}
              type="button"
            >
              <span className="project-dot" style={{ background: project.color }} />
              <span className="project-list__name">{project.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="sidebar-action-button" onClick={onImport} type="button">
          导入
        </button>
        <button className="sidebar-action-button" onClick={onExport} type="button">
          导出
        </button>
      </div>

      {currentUser ? (
        <div className="account-card">
          <div className="account-card__avatar">
            {currentUser.avatar ? (
              <img alt={currentUser.name} src={currentUser.avatar} />
            ) : (
              <span>{String(currentUser.name || "P").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="account-card__copy">
            <div className="account-card__name">{currentUser.name}</div>
            <div className="account-card__email">{currentUser.email || "本地账号"}</div>
            <div className="account-card__status">已登录</div>
          </div>
          <button className="account-card__logout" onClick={onLogout} type="button">
            退出
          </button>
        </div>
      ) : null}
    </aside>
  );
}
