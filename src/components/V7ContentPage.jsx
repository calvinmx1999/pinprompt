const TYPE_LABEL = {
  learningPath: "系统课程",
  case: "实战教程",
  article: "工具文章",
  template: "提示词模板",
};

const NOTE_CLASS = ["mint", "pink", "yellow"];
const PATH_ICONS = ["✍", "▣", "▶"];
const CASE_IMAGES = [
  "/v7-assets/v7-02-106bd22cb4.webp",
  "/v7-assets/v7-03-47ce5b3d68.webp",
  "/v7-assets/v7-04-ade1b34fba.webp",
  "/v7-assets/v7-05-10c8163e75.webp",
];

function FavoriteButton({ item, onToggleFavorite }) {
  return (
    <button
      aria-label={item.favorite ? "取消收藏" : "收藏"}
      className={`v7-favorite${item.favorite ? " is-active" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onToggleFavorite(item.id);
      }}
      type="button"
    >
      ★
    </button>
  );
}

function PathCard({ item, index, onOpenItem }) {
  return (
    <article className={`v7-path-card v7-note--${NOTE_CLASS[index % 3]}`}>
      <span className="v7-pin" />
      <div className="v7-path-card__number">{String(index + 1).padStart(2, "0")}</div>
      <div className="v7-path-card__icon">{PATH_ICONS[index % PATH_ICONS.length]}</div>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
      <dl>
        <div><dt>课程</dt><dd>{item.duration || `${item.steps?.length || 0} 课`}</dd></div>
        <div><dt>工具</dt><dd>{item.tools?.slice(0, 3).join(" / ")}</dd></div>
        <div><dt>适合</dt><dd>{item.level}学习者</dd></div>
      </dl>
      <button onClick={() => onOpenItem(item)} type="button">查看课程路径 →</button>
    </article>
  );
}

function CaseCard({ item, index, onOpenItem, onToggleFavorite }) {
  return (
    <article className={`v7-case-card v7-note--${NOTE_CLASS[index % 3]}`}>
      <span className="v7-pin" />
      <button className="v7-case-card__image" onClick={() => onOpenItem(item)} type="button">
        <img alt="" src={CASE_IMAGES[index % CASE_IMAGES.length]} />
      </button>
      <div className="v7-case-card__meta">
        <span>{item.direction}</span>
        <i>{item.level}</i>
        <FavoriteButton item={item} onToggleFavorite={onToggleFavorite} />
      </div>
      <h2><button onClick={() => onOpenItem(item)} type="button">{item.title}</button></h2>
      <p>{item.summary}</p>
      <footer>
        <span>{item.tools?.[0] || "通用工具"} · {item.duration}</span>
        <button onClick={() => onOpenItem(item)} type="button">跟着做 →</button>
      </footer>
    </article>
  );
}

function ArticleCard({ item, index, onOpenItem, onToggleFavorite }) {
  return (
    <article className={`v7-article-card v7-note--${NOTE_CLASS[index % 3]}`}>
      <span className="v7-tape" />
      <div className="v7-article-card__meta">
        <span>{item.scenario || "工具指南"}</span>
        <FavoriteButton item={item} onToggleFavorite={onToggleFavorite} />
      </div>
      <h2><button onClick={() => onOpenItem(item)} type="button">{item.title}</button></h2>
      <p>{item.summary}</p>
      <div className="v7-article-card__tags">
        {(item.tools || []).slice(0, 3).map((tool) => <span key={tool}>#{tool}</span>)}
      </div>
      <button className="v7-text-link" onClick={() => onOpenItem(item)} type="button">阅读全文 →</button>
    </article>
  );
}

function TemplateCard({ item, index, onCopyPrompt, onOpenItem, onToggleFavorite }) {
  return (
    <article className={`v7-template-card v7-note--${NOTE_CLASS[index % 3]}`}>
      <span className="v7-stamp">实测可用</span>
      <div className="v7-template-card__top">
        <span>{item.direction}</span>
        <FavoriteButton item={item} onToggleFavorite={onToggleFavorite} />
      </div>
      <h2><button onClick={() => onOpenItem(item)} type="button">{item.title}</button></h2>
      <div className="v7-template-card__tools">{item.tools?.slice(0, 3).join(" · ") || "通用提示词"}</div>
      <pre>{item.prompt || item.summary}</pre>
      <div className="v7-template-card__context">
        <span><b>适用：</b>{item.scenario}</span>
        <span><b>方向：</b>{item.direction}</span>
      </div>
      <footer>
        <button onClick={() => onCopyPrompt(item.id)} type="button">复制提示词</button>
        <button onClick={() => onOpenItem(item)} type="button">查看详情</button>
      </footer>
    </article>
  );
}

export default function V7ContentPage({
  filters,
  items,
  onCopyPrompt,
  onFilterChange,
  onOpenItem,
  onToggleFavorite,
  type,
  tools,
}) {
  const title =
    type === "learningPath"
      ? "系统课程"
      : type === "case"
        ? "实战教程"
        : type === "article"
          ? "工具指南"
          : type === "template"
            ? "提示词库"
            : "我的收藏";

  return (
    <section className={`v7-list-page v7-list-page--${type}`}>
      <header className="v7-list-heading">
        {type === "article" ? <div className="v7-section-kicker">AIGC TOOL GUIDE</div> : null}
        <h1>{title}</h1>
        <p>
          {type === "learningPath" && "按课程顺序学习，从第一个练习走到一件完整作品。"}
          {type === "case" && "从真实创作任务出发，跟着步骤做一次，就能掌握一套可复用的方法。"}
          {type === "article" && "了解不同 AIGC 工具擅长什么、适合谁，以及什么时候值得使用。"}
          {type === "template" && "来自课程与实战教程的可复用提示词，复制后替换成自己的任务即可。"}
          {type === "favorite" && "你收藏的课程、教程、文章和提示词都在这里。"}
        </p>
      </header>

      {type === "article" && tools?.length ? (
        <section className="v7-tool-guide">
          <h2>常用工具</h2>
          <div>
            {tools.slice(0, 8).map((tool, index) => (
              <article className={`v7-tool-card v7-note--${NOTE_CLASS[index % 3]}`} key={tool.id}>
                <header><span>{tool.emoji || "✦"}</span><i>{tool.category}</i></header>
                <h3>{tool.name}</h3>
                <p>{tool.bestFor}</p>
                <small><b>优势：</b>{tool.goodAt?.slice(0, 3).join("、")}</small>
                {tool.url ? <a href={tool.url} rel="noreferrer" target="_blank">访问官网 ↗</a> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="v7-filter-row" aria-label="内容筛选">
        <button className={filters.direction === "all" ? "is-active" : ""} onClick={() => onFilterChange("direction", "all")} type="button">全部</button>
        {filters.directions.slice(0, 8).map((direction) => (
          <button
            className={filters.direction === direction ? "is-active" : ""}
            key={direction}
            onClick={() => onFilterChange("direction", direction)}
            type="button"
          >
            {direction}
          </button>
        ))}
        {type !== "learningPath" ? (
          <>
            <select aria-label="按业务场景筛选" onChange={(event) => onFilterChange("scenario", event.target.value)} value={filters.scenario}>
              <option value="all">全部场景</option>
              {filters.scenarios.map((scenario) => <option key={scenario} value={scenario}>{scenario}</option>)}
            </select>
            <select aria-label="按工具筛选" onChange={(event) => onFilterChange("tool", event.target.value)} value={filters.tool}>
              <option value="all">全部工具</option>
              {filters.tools.map((tool) => <option key={tool} value={tool}>{tool}</option>)}
            </select>
          </>
        ) : null}
      </div>

      {!items.length ? (
        <div className="v7-empty">
          <strong>暂时没有找到相关内容</strong>
          <p>换一个关键词或筛选条件再试试。</p>
        </div>
      ) : (
        <div className={`v7-content-grid v7-content-grid--${type}`}>
          {items.map((item, index) => {
            if (item.type === "learningPath") return <PathCard item={item} index={index} key={item.id} onOpenItem={onOpenItem} />;
            if (item.type === "case") return <CaseCard item={item} index={index} key={item.id} onOpenItem={onOpenItem} onToggleFavorite={onToggleFavorite} />;
            if (item.type === "article") return <ArticleCard item={item} index={index} key={item.id} onOpenItem={onOpenItem} onToggleFavorite={onToggleFavorite} />;
            return <TemplateCard item={item} index={index} key={item.id} onCopyPrompt={onCopyPrompt} onOpenItem={onOpenItem} onToggleFavorite={onToggleFavorite} />;
          })}
        </div>
      )}

      <span className="sr-only">{TYPE_LABEL[type] || title}</span>
    </section>
  );
}
