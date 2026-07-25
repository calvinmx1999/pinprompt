const TYPE_LABEL = {
  image: "图片",
  video: "视频",
  text: "文本",
  workflow: "工作流",
};

const NOTE_COLORS = ["mint", "pink", "yellow"];

export default function V7UserPromptLibrary({
  prompts,
  searchQuery,
  syncState,
  onCopy,
  onEdit,
  onNew,
  onSearch,
  onToggleFavorite,
}) {
  const query = searchQuery.trim().toLowerCase();
  const visiblePrompts = prompts.filter((prompt) => {
    if (!query) return true;
    return [
      prompt.title,
      prompt.content,
      ...(prompt.platforms || []),
      ...(prompt.tags || []),
      ...(prompt.taskTags || []),
      ...(prompt.effectTags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <section className="v7-user-library">
      <header className="v7-user-library__head">
        <div>
          <span>MY PROMPT LIBRARY</span>
          <h1>我的提示词</h1>
          <p>原账号中的提示词、收藏和使用记录会自动从云端同步。</p>
        </div>
        <div className="v7-user-library__actions">
          <div className={`v7-sync-state v7-sync-state--${syncState}`}>
            <i />
            {syncState === "loading"
              ? "同步中"
              : syncState === "error"
                ? "同步失败"
                : "云端已同步"}
          </div>
          <button onClick={onNew} type="button">＋ 新建提示词</button>
        </div>
      </header>

      <label className="v7-user-library__search">
        <span>⌕</span>
        <input
          onChange={(event) => onSearch(event.target.value)}
          placeholder="搜索自己的提示词、平台或标签..."
          value={searchQuery}
        />
      </label>

      {!visiblePrompts.length ? (
        <div className="v7-user-library__empty">
          <strong>{query ? "没有找到相关提示词" : "账号里还没有提示词"}</strong>
          <p>{query ? "换一个关键词再试试。" : "创建第一条提示词，之后会自动保存到你的云端账号。"}</p>
          {!query ? <button onClick={onNew} type="button">新建第一条提示词</button> : null}
        </div>
      ) : (
        <div className="v7-user-prompt-grid">
          {visiblePrompts.map((prompt, index) => (
            <article
              className={`v7-user-prompt-card v7-note--${NOTE_COLORS[index % NOTE_COLORS.length]}`}
              key={prompt.id}
            >
              <span className="v7-tape" />
              <div className="v7-user-prompt-card__top">
                <span>{TYPE_LABEL[prompt.type] || "提示词"}</span>
                <button
                  aria-label={prompt.favorite ? "取消收藏" : "收藏"}
                  className={`v7-favorite${prompt.favorite ? " is-active" : ""}`}
                  onClick={() => onToggleFavorite(prompt.id)}
                  type="button"
                >
                  ★
                </button>
              </div>
              <h2>{prompt.title}</h2>
              <div className="v7-user-prompt-card__platforms">
                {(prompt.platforms || ["通用版"]).slice(0, 3).map((platform) => (
                  <span key={platform}>{platform}</span>
                ))}
              </div>
              <p>{prompt.content}</p>
              <div className="v7-user-prompt-card__meta">
                <span>使用 {prompt.usedCount || 0} 次</span>
                {prompt.favorite ? <b>已收藏</b> : null}
              </div>
              <footer>
                <button onClick={() => onCopy(prompt)} type="button">复制</button>
                <button onClick={() => onEdit(prompt)} type="button">编辑</button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
