function promptTypeLabel(type) {
  const labels = {
    image: "图片",
    video: "视频",
    text: "文本",
    workflow: "工作流",
  };
  return labels[type] || "模板";
}

export default function LegacyPromptShelf({ prompts = [], onCopyPrompt, onCreatePrompt, onOpenLibrary }) {
  const visiblePrompts = prompts.slice(0, 6);

  if (!visiblePrompts.length) {
    return (
      <section className="legacy-prompt-shelf legacy-prompt-shelf--empty">
        <div>
          <h2>提示词收藏</h2>
          <p>登录后会从原账号同步提示词，也可以直接创建第一条新内容。</p>
        </div>
        <button className="primary-button primary-button--small" onClick={onCreatePrompt} type="button">
          新建提示词
        </button>
      </section>
    );
  }

  return (
    <section className="legacy-prompt-shelf">
      <div className="dashboard-section__head">
        <div>
          <h2>提示词收藏</h2>
          <p>来自原账号的云端提示词，学习完课程后可以继续复制和维护。</p>
        </div>
        <button className="v7-text-link" onClick={onOpenLibrary} type="button">查看全部 →</button>
      </div>

      <div className="legacy-prompt-list">
        {visiblePrompts.map((prompt) => (
          <article className="legacy-prompt-card" key={prompt.id}>
            <div className="legacy-prompt-card__top">
              <span>{promptTypeLabel(prompt.type)}</span>
              {prompt.favorite ? <strong>已收藏</strong> : null}
            </div>
            <h3>{prompt.title}</h3>
            <p>{prompt.content}</p>
            <div className="legacy-prompt-card__meta">
              {(prompt.platforms || []).slice(0, 2).map((platform) => (
                <span key={platform}>{platform}</span>
              ))}
              <span>使用 {prompt.usedCount || 0} 次</span>
            </div>
            <button type="button" onClick={() => onCopyPrompt(prompt)}>
              复制提示词
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
