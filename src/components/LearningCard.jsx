import { buildLearningPreview, favoriteBadgeText } from "../lib/learningSite.js";

const TYPE_COLOR = {
  learningPath: "mint",
  case: "pink",
  article: "blue",
  template: "yellow",
};

const TYPE_LABEL = {
  learningPath: "学习路径",
  case: "实战案例",
  article: "工具专栏",
  template: "提示词模板",
};

export default function LearningCard({ item, selected, onSelect, onToggleFavorite, onCopyPrompt }) {
  const color = TYPE_COLOR[item.type] || "yellow";

  return (
    <article
      className={`prompt-card prompt-card--${color}${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="prompt-card__head">
        <div className="prompt-card__meta">
          <span className={`meta-chip meta-chip--${color}`}>{TYPE_LABEL[item.type]}</span>
          <span className="meta-chip meta-chip--platform">{favoriteBadgeText(item)}</span>
        </div>
        <button
          className={`icon-toggle${item.favorite ? " is-active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(item.id);
          }}
          type="button"
        >
          ★
        </button>
      </div>

      <h3 className="prompt-card__title">{item.title}</h3>
      <p className="prompt-card__preview">{buildLearningPreview(item.summary, 96)}</p>

      <div className="prompt-card__tags">
        <span className="tag-chip">{item.direction}</span>
        <span className="tag-chip">{item.scenario}</span>
        {(item.tools || []).slice(0, 1).map((tool) => (
          <span className="tag-chip" key={tool}>
            {tool}
          </span>
        ))}
      </div>

      <div className="prompt-card__footer">
        <span className="prompt-card__usage">
          {(item.tools || []).slice(0, 2).join(" / ") || "课程内容"}
        </span>
        <div className="prompt-card__actions">
          {item.prompt ? (
            <button
              className="ghost-button"
              onClick={(event) => {
                event.stopPropagation();
                onCopyPrompt(item.id);
              }}
              type="button"
            >
              一键复制
            </button>
          ) : null}
          <button
            className="primary-button primary-button--small"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
            type="button"
          >
            {item.type === "template" ? "查看模板" : "进入学习"}
          </button>
        </div>
      </div>
    </article>
  );
}
