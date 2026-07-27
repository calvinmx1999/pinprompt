const STATUS_LABELS = {
  draft: "草稿预览",
  published: "已发布",
  archived: "已归档",
};

function formatDate(value) {
  if (!value) return "未填写";
  const [year, month, day] = String(value).split("-");
  return year && month && day
    ? `${year}年${Number(month)}月${Number(day)}日`
    : value;
}

export default function ContentMeta({ item }) {
  return (
    <section className="content-meta" aria-label="内容信息">
      <strong>内容信息</strong>
      <dl>
        <div><dt>最近更新</dt><dd>{formatDate(item.lastReviewedAt || item.updatedAt)}</dd></div>
        <div><dt>内容版本</dt><dd>{item.version}</dd></div>
        <div><dt>阅读时间</dt><dd>{item.readTime || "按需阅读"}</dd></div>
        <div><dt>内容难度</dt><dd>{item.level}</dd></div>
        <div><dt>内容状态</dt><dd>{STATUS_LABELS[item.status] || item.status}</dd></div>
      </dl>

      {item.tools.length ? (
        <div className="content-meta__group">
          <span>适用工具</span>
          <div>{item.tools.map((tool) => <b key={tool}>{tool}</b>)}</div>
        </div>
      ) : null}

      {item.applicableVersions.length ? (
        <div className="content-meta__group">
          <span>适用版本</span>
          <ul>
            {item.applicableVersions.map((version) => <li key={version}>{version}</li>)}
          </ul>
        </div>
      ) : null}

      {item.changeSummary ? (
        <p className="content-meta__change">
          <span>本次更新</span>
          {item.changeSummary}
        </p>
      ) : null}
    </section>
  );
}
