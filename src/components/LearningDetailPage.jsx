function SectionList({ title, items, renderItem }) {
  if (!items?.length) return null;
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <div className="detail-list">
        {items.map((item, index) => (
          <div className="detail-list__item" key={item.title || item.problem || `${title}_${index}`}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LearningDetailPage({ item, onBack, onToggleFavorite, onCopyPrompt }) {
  if (!item) {
    return (
      <div className="empty-grid">
        <div className="empty-grid__title">内容不存在</div>
        <div className="empty-grid__body">可以先返回上一页，继续从学习路径或案例里挑一个开始。</div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button className="text-button detail-back" onClick={onBack} type="button">
        返回列表
      </button>

      <section className="detail-hero">
        <div className="detail-hero__copy">
          <div className="detail-hero__meta">
            <span className="meta-chip meta-chip--blue">{item.direction}</span>
            <span className="meta-chip meta-chip--platform">{item.scenario}</span>
            <span className="meta-chip meta-chip--platform">{item.level}</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </div>
        <div className="detail-hero__actions">
          <button className="secondary-button" onClick={() => onToggleFavorite(item.id)} type="button">
            {item.favorite ? "取消收藏" : "加入收藏"}
          </button>
          {item.prompt ? (
            <button className="primary-button" onClick={() => onCopyPrompt(item.id)} type="button">
              一键复制提示词
            </button>
          ) : null}
        </div>
      </section>

      {item.outcome ? (
        <section className="detail-section">
          <h3>你将学会什么</h3>
          <div className="detail-callout">{item.outcome}</div>
        </section>
      ) : null}

      <SectionList
        title={item.type === "article" ? "核心内容" : "学习步骤"}
        items={item.articleSections?.length ? item.articleSections : item.steps}
        renderItem={(entry, index) => (
          <>
            <strong>{entry.title || `步骤 ${index + 1}`}</strong>
            <p>{entry.content || entry.description}</p>
          </>
        )}
      />

      <SectionList
        title="练习任务"
        items={item.practiceTasks}
        renderItem={(entry) => <p>{entry}</p>}
      />

      <SectionList
        title="常见错误与修改方法"
        items={item.commonMistakes}
        renderItem={(entry) => (
          <>
            <strong>{entry.problem}</strong>
            <p>{entry.fix}</p>
          </>
        )}
      />

      <SectionList
        title="进一步优化建议"
        items={item.fixTips}
        renderItem={(entry) => <p>{entry}</p>}
      />

      {item.prompt ? (
        <section className="detail-section">
          <h3>练习用提示词</h3>
          <pre className="prompt-content prompt-content--large">{item.prompt}</pre>
        </section>
      ) : null}
    </div>
  );
}
