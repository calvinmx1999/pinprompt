function HomeSection({ title, body, items, onOpenItem }) {
  return (
    <section className="home-section">
      <div className="home-section__head">
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
      </div>

      <div className="home-strip">
        {items.map((item) => (
          <button className="home-strip__card" key={item.id} onClick={() => onOpenItem(item)} type="button">
            <span className="home-strip__eyebrow">{item.direction}</span>
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function LearningHomePage({ items, onOpenItem }) {
  const featuredPaths = items.filter((item) => item.type === "learningPath" && item.featured).slice(0, 3);
  const featuredCases = items.filter((item) => item.type === "case").slice(0, 3);
  const featuredArticles = items.filter((item) => item.type === "article").slice(0, 3);
  const featuredTemplates = items.filter((item) => item.type === "template").slice(0, 3);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="home-hero__kicker">系统性的 AIGC 实战学习网站</span>
          <h1>从零开始，学会 AIGC 创作</h1>
          <p>
            用简单、有趣、可实操的课程案例，学会 AI 文案、AI 海报、AI 视频和内容生产。
          </p>
        </div>
        <div className="home-hero__stats">
          <div className="home-stat">
            <strong>{items.filter((item) => item.type === "learningPath").length}</strong>
            <span>学习路径</span>
          </div>
          <div className="home-stat">
            <strong>{items.filter((item) => item.type === "case").length}</strong>
            <span>实战案例</span>
          </div>
          <div className="home-stat">
            <strong>{items.filter((item) => item.type === "template").length}</strong>
            <span>提示词模板</span>
          </div>
        </div>
      </section>

      <HomeSection
        title="先从学习路径开始"
        body="适合零基础用户按顺序推进，知道今天该学什么、练什么。"
        items={featuredPaths}
        onOpenItem={onOpenItem}
      />
      <HomeSection
        title="跟着案例学最快"
        body="每个案例都拆到步骤、练习任务、常见错误和修改方法。"
        items={featuredCases}
        onOpenItem={onOpenItem}
      />
      <HomeSection
        title="工具专栏帮你少走弯路"
        body="先知道工具擅长什么，再决定什么时候该用它。"
        items={featuredArticles}
        onOpenItem={onOpenItem}
      />
      <HomeSection
        title="模板拿来就能练"
        body="看完路径和案例以后，直接复制模板开始动手。"
        items={featuredTemplates}
        onOpenItem={onOpenItem}
      />
    </div>
  );
}
