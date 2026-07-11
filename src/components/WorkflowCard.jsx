export default function WorkflowCard({
  workflow,
  selected,
  onSelect,
  onStart,
  onToggleFavorite,
}) {
  return (
    <article
      className={`workflow-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(workflow.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(workflow.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="workflow-card__head">
        <div className="workflow-card__meta">
          <span className="meta-chip meta-chip--blue">工作流</span>
          <span className="meta-chip meta-chip--platform">{workflow.steps.length} 个步骤</span>
        </div>
        <button
          className={`icon-toggle${workflow.favorite ? " is-active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(workflow.id);
          }}
          type="button"
        >
          ★
        </button>
      </div>

      <h3 className="workflow-card__title">{workflow.title}</h3>
      <p className="workflow-card__description">{workflow.description}</p>

      <div className="workflow-card__platforms">
        {(workflow.platforms || []).slice(0, 3).map((platform) => (
          <span className="tag-chip" key={platform}>
            {platform}
          </span>
        ))}
      </div>

      <div className="workflow-card__tags">
        {(workflow.tags || []).slice(0, 3).map((tag) => (
          <span className="tag-chip tag-chip--muted" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="workflow-card__footer">
        <span className="prompt-card__usage">使用 {workflow.usedCount || 0} 次</span>
        <button
          className="primary-button primary-button--small"
          onClick={(event) => {
            event.stopPropagation();
            onStart(workflow.id);
          }}
          type="button"
        >
          开始使用
        </button>
      </div>
    </article>
  );
}
