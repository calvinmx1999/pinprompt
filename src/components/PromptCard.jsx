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
  onOpen,
  onCopy,
  onUse,
  onToggleFavorite,
}) {
  const typeColor = TYPE_COLOR[prompt.type] || "yellow";
  const platforms = [...new Set(prompt.platforms || [])].filter(Boolean);
  const tags = [...new Set([...(prompt.taskTags || []), ...(prompt.effectTags || []), ...(prompt.tags || [])])]
    .filter(Boolean);
  const visiblePlatforms = platforms.slice(0, 1);
  const hiddenPlatformCount = Math.max(0, platforms.length - visiblePlatforms.length);
  const visibleTags = tags.slice(0, 2);
  const hiddenTagCount = Math.max(0, tags.length - visibleTags.length);

  return (
    <article
      className={`prompt-card prompt-card--${typeColor}${selected ? " is-selected" : ""}`}
      aria-haspopup="dialog"
      aria-label={`${prompt.title}，打开完整提示词`}
      onClick={() => {
        onSelect(prompt.id);
        if (window.matchMedia("(max-width: 640px), (pointer: coarse)").matches) onOpen(prompt.id);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        onOpen(prompt.id);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (batchMode) return;
        if (event.key === "Enter") {
          event.preventDefault();
          onSelect(prompt.id);
          onOpen(prompt.id);
        } else if (event.key === " ") {
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
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <input checked={checked} onChange={() => onToggleSelect(prompt.id)} type="checkbox" />
            </label>
          ) : null}
          <span className={`meta-chip meta-chip--${typeColor}`}>{TYPE_LABEL[prompt.type]}</span>
          {visiblePlatforms.map((platform) => (
            <span className="meta-chip meta-chip--platform" key={platform}>
              {platform}
            </span>
          ))}
          {hiddenPlatformCount ? <span className="meta-chip meta-chip--count">+{hiddenPlatformCount}</span> : null}
        </div>
        <button
          className={`icon-toggle${prompt.favorite ? " is-active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(prompt.id);
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          type="button"
          aria-label={prompt.favorite ? "取消收藏" : "收藏"}
        >
          ★
        </button>
      </div>

      <h3 className="prompt-card__title">{prompt.title}</h3>
      <p className="prompt-card__preview">{buildPromptPreview(prompt.content)}</p>

      <div className="prompt-card__tags">
        {visibleTags.length ? (
          <>
            {visibleTags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
              </span>
            ))}
            {hiddenTagCount ? <span className="tag-chip tag-chip--count">+{hiddenTagCount}</span> : null}
          </>
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
            onDoubleClick={(event) => event.stopPropagation()}
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
            onDoubleClick={(event) => event.stopPropagation()}
            type="button"
          >
            使用
          </button>
        </div>
      </div>
    </article>
  );
}
