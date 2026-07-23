export default function LearningSidebar({
  currentUser,
  currentView,
  counts,
  onLoginRequest,
  onViewChange,
  onLogout,
}) {
  const navItems = [
    { id: "home", label: "首页", count: null },
    { id: "learningPaths", label: "学习路径", count: counts.learningPaths },
    { id: "cases", label: "实战案例", count: counts.cases },
    { id: "articles", label: "工具专栏", count: counts.articles },
    { id: "templates", label: "提示词模板", count: counts.templates },
    { id: "favorites", label: "我的收藏", count: counts.favorites },
  ];

  const activeGroup =
    currentView === "pathDetail"
      ? "learningPaths"
      : currentView === "caseDetail"
        ? "cases"
        : currentView === "articleDetail"
          ? "articles"
          : currentView;

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
          <div className="brand-copy__sub">AIGC 实战学习站</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section__label">导航</div>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav__item${activeGroup === item.id ? " is-active" : ""}`}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              <span>{item.label}</span>
              {item.count !== null ? <strong>{item.count}</strong> : <strong>•</strong>}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section sidebar-section--grow">
        <div className="sidebar-section__label">学习方向</div>
        <div className="sidebar-learning-note">
          从课程路径到案例拆解，再到工具理解和模板练习，把 AIGC 学成一套能持续复用的能力。
        </div>
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
            <div className="account-card__status">本地学习记录已开启</div>
          </div>
          <button className="account-card__logout" onClick={onLogout} type="button">
            退出
          </button>
        </div>
      ) : (
        <div className="account-card account-card--guest">
          <div className="account-card__avatar">
            <span>学</span>
          </div>
          <div className="account-card__copy">
            <div className="account-card__name">游客模式</div>
            <div className="account-card__email">可浏览课程和模板</div>
            <div className="account-card__status">登录后保存学习记录</div>
          </div>
          <button className="account-card__logout" onClick={onLoginRequest} type="button">
            登录
          </button>
        </div>
      )}
    </aside>
  );
}
