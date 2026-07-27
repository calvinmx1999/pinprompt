export default function ContentSources({ sources }) {
  if (!sources?.length) return null;

  return (
    <section className="content-sources">
      <header>
        <span>资料核对</span>
        <h2>参考来源</h2>
        <p>以下资料用于帮助理解概念和确认更新时间。</p>
      </header>
      <div>
        {sources.map((source) => (
          <article key={`${source.title}-${source.url}`}>
            <div>
              <strong>{source.title}</strong>
              <p>
                {source.publisher || "来源未注明"}
                {source.publishedAt ? ` · ${source.publishedAt}` : ""}
              </p>
            </div>
            <a href={source.url} rel="noreferrer noopener" target="_blank">
              查看原文 ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
