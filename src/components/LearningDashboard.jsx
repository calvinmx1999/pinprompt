import LegacyPromptShelf from "./LegacyPromptShelf.jsx";

function DashboardCard({ item, onOpenItem }) {
  return (
    <button className="dashboard-card" type="button" onClick={() => onOpenItem(item)}>
      <span>{item.direction}</span>
      <strong>{item.title}</strong>
      <p>{item.summary}</p>
      <em>{item.duration || item.level}</em>
    </button>
  );
}

function ToolCompare({ tools = [] }) {
  if (!tools.length) return null;

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__head">
        <div>
          <h2>工具对比</h2>
          <p>先知道每个工具擅长什么，再决定用哪个完成任务。</p>
        </div>
      </div>
      <div className="tool-compare-grid">
        {tools.slice(0, 4).map((tool) => (
          <article className="tool-compare-card" key={tool.id}>
            <div className="tool-compare-card__head">
              <strong>{tool.name}</strong>
              <span>{tool.category}</span>
            </div>
            <p>{tool.bestFor}</p>
            <div className="tool-compare-card__tags">
              {(tool.goodAt || []).slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function LearningDashboard({
  items,
  onCopyLegacyPrompt,
  onOpenItem,
  prompts,
  tools,
}) {
  const featuredPaths = items.filter((item) => item.type === "learningPath").slice(0, 3);
  const featuredCases = items.filter((item) => item.type === "case").slice(0, 3);
  const nextLesson = featuredPaths[0] || items[0];
  const marqueeItems = items.filter((item) => item.featured).slice(0, 8);

  return (
    <div className="learning-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <span>系统性的 AIGC 实战学习站</span>
          <h1>从零开始，学会 AIGC 创作</h1>
          <p>用简单、有趣、可实操的课程案例，学会 AI 文案、AI 海报、AI 视频和内容生产。</p>
        </div>
        <div className="dashboard-visual" aria-label="AIGC 学习内容预览">
          <div className="dashboard-visual__frame dashboard-visual__frame--main">
            <strong>AI 视频实战</strong>
            <span>镜头 · 转场 · 提示词</span>
          </div>
          <div className="dashboard-visual__frame dashboard-visual__frame--pink">案例拆解</div>
          <div className="dashboard-visual__frame dashboard-visual__frame--green">模板练习</div>
        </div>
      </section>

      <div className="dashboard-marquee" aria-label="热门学习内容">
        <div className="dashboard-marquee__track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item.id}-${index}`}>{item.title}</span>
          ))}
        </div>
      </div>

      {nextLesson ? (
        <section className="continue-panel">
          <div>
            <span>继续学习</span>
            <h2>{nextLesson.title}</h2>
            <p>{nextLesson.outcome || nextLesson.summary}</p>
          </div>
          <button type="button" onClick={() => onOpenItem(nextLesson)}>
            继续学习
          </button>
        </section>
      ) : null}

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <div>
            <h2>推荐课程</h2>
            <p>按学习路径推进，比零散收藏模板更容易形成实战能力。</p>
          </div>
        </div>
        <div className="dashboard-card-grid">
          {featuredPaths.map((item) => (
            <DashboardCard item={item} key={item.id} onOpenItem={onOpenItem} />
          ))}
        </div>
      </section>

      <ToolCompare tools={tools} />

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <div>
            <h2>案例拆解</h2>
            <p>看步骤、练任务、避开常见错误，快速把方法跑通一遍。</p>
          </div>
        </div>
        <div className="dashboard-card-grid">
          {featuredCases.map((item) => (
            <DashboardCard item={item} key={item.id} onOpenItem={onOpenItem} />
          ))}
        </div>
      </section>

      <LegacyPromptShelf prompts={prompts} onCopyPrompt={onCopyLegacyPrompt} />
    </div>
  );
}
