import { buildPromptPreview } from "../lib/storage.js";

const TYPE_COLOR = {
  image: "mint",
  video: "pink",
  text: "yellow",
  workflow: "blue",
};

const TYPE_LABEL = {
  image: "图片",
  video: "视频",
  text: "文本",
  workflow: "工作流",
};

export default function PromptCard({
  prompt,
  selected,
  batchMode,
  checked,
  onToggleSelect,
  onSelect,
  onCopy,
  onUse,
  onToggleFavorite,
}) {
  const typeColor = TYPE_COLOR[prompt.type] || "yellow";
  const tags = [...(prompt.taskTags || []), ...(prompt.effectTags || []), ...(prompt.tags || [])]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article
      className={`prompt-card prompt-card--${typeColor}${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(prompt.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (batchMode) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(prompt.id);
        }
      }}
    >
      <div className="prompt-card__head">
        <div className="prompt-card__meta">
          {batchMode ? (
            <label
              className="prompt-card__checkbox"
              onClick={(event) => event.stopPropagation()}
            >
              <input checked={checked} onChange={() => onToggleSelect(prompt.id)} type="checkbox" />
            </label>
          ) : null}
          <span className={`meta-chip meta-chip--${typeColor}`}>{TYPE_LABEL[prompt.type]}</span>
          {(prompt.platforms || []).slice(0, 2).map((platform) => (
            <span className="meta-chip meta-chip--platform" key={platform}>
              {platform}
            </span>
          ))}
        </div>
        <button
          className={`icon-toggle${prompt.favorite ? " is-active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(prompt.id);
          }}
          type="button"
          aria-label={prompt.favorite ? "取消收藏" : "收藏"}
        >
          ★
        </button>
      </div>

      <h3 className="prompt-card__title">{prompt.title}</h3>
      <p className="prompt-card__preview">{buildPromptPreview(prompt.content)}</p>

      <div className="prompt-card__tags">
        {tags.length ? (
          tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))
        ) : (
          <span className="tag-chip tag-chip--muted">通用创作</span>
        )}
      </div>

      <div className="prompt-card__footer">
        <span className="prompt-card__usage">使用 {prompt.usedCount || 0} 次</span>
        <div className="prompt-card__actions">
          <button
            className="ghost-button"
            onClick={(event) => {
              event.stopPropagation();
              if (batchMode) return;
              onCopy(prompt.id);
            }}
            type="button"
          >
            复制
          </button>
          <button
            className="primary-button primary-button--small"
            onClick={(event) => {
              event.stopPropagation();
              if (batchMode) return;
              onUse(prompt.id);
            }}
            type="button"
          >
            使用
          </button>
        </div>
      </div>
    </article>
  );
}
