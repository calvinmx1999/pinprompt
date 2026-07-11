export default function TemplateInspector({ item, onCopyPrompt, onToggleFavorite }) {
  if (!item) {
    return (
      <aside className="inspector-empty">
        <div>
          <div className="inspector-empty__icon">✦</div>
          <div className="inspector-empty__title">选一条模板开始练习</div>
          <div className="inspector-empty__body">
            这里会展示完整提示词、适用工具和练习提醒，方便你边学边复制。
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <div className="inspector__section">
        <div className="inspector__header">
          <div>
            <div className="inspector__meta-row">
              <span className="meta-chip meta-chip--yellow">提示词模板</span>
              <span className="meta-chip meta-chip--platform">{item.direction}</span>
            </div>
            <h2>{item.title}</h2>
          </div>
          <button
            className={`icon-toggle icon-toggle--solid${item.favorite ? " is-active" : ""}`}
            onClick={() => onToggleFavorite(item.id)}
            type="button"
          >
            ★
          </button>
        </div>
        <div className="inspector__notice">{item.summary}</div>
      </div>

      <div className="inspector__section">
        <div className="section-title">适用工具</div>
        <div className="inspector__platforms">
          {(item.tools || []).map((tool) => (
            <span className="platform-tab is-active" key={tool}>
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div className="inspector__section">
        <div className="section-title">完整提示词</div>
        <pre className="prompt-content">{item.prompt || "暂无模板内容"}</pre>
      </div>

      {item.practiceTasks?.length ? (
        <div className="inspector__section">
          <div className="section-title">练习建议</div>
          <div className="detail-list detail-list--tight">
            {item.practiceTasks.map((task) => (
              <div className="detail-list__item" key={task}>
                <p>{task}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="inspector__section inspector__section--actions">
        <div className="action-row">
          <button className="primary-button" onClick={() => onCopyPrompt(item.id)} type="button">
            一键复制提示词
          </button>
        </div>
      </div>
    </aside>
  );
}
