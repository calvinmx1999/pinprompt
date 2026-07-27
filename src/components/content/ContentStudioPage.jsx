import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CONTENT_TYPES,
  getAllContentForStudio,
  getAllModules,
  getContentIssues,
  getContentUrl,
} from "../../lib/contentLoader.js";

const STATUS_LABELS = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

const TYPE_OPTIONS = [
  ["all", "全部类型"],
  ["learningPath", "学习路径"],
  ...Object.entries(CONTENT_TYPES)
    .filter(([key]) => key !== "learningPath")
    .map(([key, value]) => [key, value.label]),
];

export default function ContentStudioPage({ onCopy }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [moduleId, setModuleId] = useState("all");
  const [updated, setUpdated] = useState("all");
  const modules = getAllModules();

  useEffect(() => {
    document.title = "内容工作台｜PinPrompt 拼好词";
  }, []);

  const items = useMemo(() => {
    const now = Date.now();
    const dayLimit = updated === "7" ? 7 : updated === "30" ? 30 : null;
    return getAllContentForStudio()
      .filter((item) => type === "all" || item.type === type)
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => moduleId === "all" || item.moduleId === moduleId)
      .filter((item) => {
        if (!dayLimit || !item.updatedAt) return true;
        return now - new Date(item.updatedAt).getTime() <= dayLimit * 86400000;
      })
      .filter((item) => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return true;
        return [item.title, item.slug, item.summary, item.sourcePath]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }, [moduleId, query, status, type, updated]);

  return (
    <section className="content-studio">
      <header className="content-studio__head">
        <div>
          <span>仅限预览环境</span>
          <h1>PinPrompt内容工作台</h1>
          <p>查看草稿、正式内容和归档状态。内容仍通过本地Markdown维护。</p>
        </div>
        <strong>{items.length} 条内容</strong>
      </header>

      <section className="content-studio__guide">
        <div><span>01</span><strong>创建</strong><code>npm run content:new</code></div>
        <div><span>02</span><strong>编写</strong><p>填写Markdown正文和元数据</p></div>
        <div><span>03</span><strong>检查</strong><code>npm run content:check</code></div>
        <div><span>04</span><strong>发布</strong><code>npm run content:publish -- 文件路径</code></div>
      </section>

      <div className="content-studio__filters">
        <input aria-label="搜索内容文件" onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、slug或文件路径..." value={query} />
        <select aria-label="内容类型" onChange={(event) => setType(event.target.value)} value={type}>
          {TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="发布状态" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        <select aria-label="所属模块" onChange={(event) => setModuleId(event.target.value)} value={moduleId}>
          <option value="all">全部模块</option>
          {modules.map((module) => <option key={module.id} value={module.id}>{module.number} {module.title}</option>)}
        </select>
        <select aria-label="更新时间" onChange={(event) => setUpdated(event.target.value)} value={updated}>
          <option value="all">全部更新时间</option>
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
        </select>
      </div>

      <div className="content-studio__list">
        {!items.length ? (
          <div className="modular-empty-state">
            <strong>没有符合条件的内容</strong>
            <p>换一个关键词或清除筛选条件再试试。</p>
          </div>
        ) : null}
        {items.map((item) => {
          const issues = getContentIssues(item);
          const hasError = issues.some((issue) => issue.level === "error");
          const previewUrl = `${getContentUrl(item)}?preview=1`;
          return (
            <article key={item.id}>
              <div className="content-studio__item-main">
                <div className="content-studio__badges">
                  <span className={`status-${item.status}`}>{STATUS_LABELS[item.status]}</span>
                  <span>{CONTENT_TYPES[item.type]?.label || "学习路径"}</span>
                  {hasError ? <span className="status-error">存在错误</span> : null}
                  {!hasError && issues.length ? <span className="status-warning">存在警告</span> : null}
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary || "尚未填写摘要"}</p>
                <code>{item.sourcePath}</code>
              </div>
              <dl>
                <div><dt>slug</dt><dd>{item.slug}</dd></div>
                <div><dt>更新时间</dt><dd>{item.updatedAt || "未填写"}</dd></div>
                <div><dt>正式URL</dt><dd>https://pinprompt.art{getContentUrl(item)}</dd></div>
              </dl>
              {issues.length ? (
                <ul className="content-studio__issues">
                  {issues.map((issue) => <li key={issue.message}>{issue.message}</li>)}
                </ul>
              ) : null}
              <div className="content-studio__actions">
                <button onClick={() => navigate(previewUrl)} type="button">预览</button>
                <button onClick={() => onCopy(`${window.location.origin}${previewUrl}`, "已复制预览地址")} type="button">
                  复制URL
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="content-studio__reference">
        <h2>字段与Markdown速查</h2>
        <div>
          <article>
            <strong>六类内容</strong>
            <p>学习路径、知识点、工作流、工具、AI前沿、提示词模板共用稳定的id、slug和状态字段。</p>
          </article>
          <article>
            <strong>Prompt模块</strong>
            <pre>{"```prompt\n请在这里填写可复制的提示词。\n```"}</pre>
          </article>
          <article>
            <strong>图片与提示</strong>
            <pre>{"![图片说明](/content-assets/knowledge/slug/example.webp)\n\n> 这里是一条重点提示。"}</pre>
          </article>
        </div>
      </section>
    </section>
  );
}
