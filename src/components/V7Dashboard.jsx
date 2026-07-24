import LegacyPromptShelf from "./LegacyPromptShelf.jsx";

export default function V7Dashboard({ currentUser, items, onCopyLegacyPrompt, onOpenItem, prompts, tools }) {
  const paths = items.filter((item) => item.type === "learningPath").slice(0, 3);
  const cases = items.filter((item) => item.type === "case").slice(0, 3);
  const next = paths[0];

  return (
    <div className="v7-dashboard">
      <section className="v7-dashboard__welcome">
        <div>
          <span>MY LEARNING DESK</span>
          <h1>你好，{currentUser?.name || "AIGC 学员"}</h1>
          <p>继续完成一件作品，或者从一条新课程开始。</p>
        </div>
        <button onClick={() => next && onOpenItem(next)} type="button">继续学习 →</button>
      </section>

      {next ? (
        <section className="v7-focus-card">
          <div>
            <span>正在学习</span>
            <h2>{next.title}</h2>
            <p>{next.summary}</p>
            <div className="v7-progress"><i /></div>
            <small>已完成 1 / {next.steps?.length || 5} 课</small>
          </div>
          <img alt="" src="/v7-assets/v7-07-697f4e15b0.webp" />
        </section>
      ) : null}

      <section className="v7-dashboard-section">
        <header><div><span>RECOMMENDED</span><h2>推荐课程</h2></div></header>
        <div className="v7-dashboard-grid">
          {paths.map((item, index) => (
            <button className={`v7-dashboard-note v7-note--${["mint", "pink", "yellow"][index % 3]}`} key={item.id} onClick={() => onOpenItem(item)} type="button">
              <small>{item.duration}</small>
              <strong>{item.title}</strong>
              <span>{item.summary}</span>
              <b>进入课程 →</b>
            </button>
          ))}
        </div>
      </section>

      <section className="v7-dashboard-columns">
        <div className="v7-dashboard-section">
          <header><div><span>CASE STUDIES</span><h2>案例拆解</h2></div></header>
          <div className="v7-dashboard-list">
            {cases.map((item, index) => (
              <button key={item.id} onClick={() => onOpenItem(item)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><small>{item.tools?.[0]} · {item.duration}</small></div>
                <b>→</b>
              </button>
            ))}
          </div>
        </div>

        <div className="v7-dashboard-section">
          <header><div><span>TOOL PICKS</span><h2>工具速查</h2></div></header>
          <div className="v7-dashboard-tools">
            {tools.slice(0, 4).map((tool) => (
              <article key={tool.id}>
                <span>{tool.emoji || "✦"}</span>
                <div><strong>{tool.name}</strong><small>{tool.bestFor}</small></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LegacyPromptShelf prompts={prompts} onCopyPrompt={onCopyLegacyPrompt} />
    </div>
  );
}
