import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CONTENT_TYPES,
  getAdjacentContent,
  getContentBySlug,
  getContentUrl,
  getKnowledgeByModule,
  getModulesByPath,
  getRelatedContent,
} from "../../lib/contentLoader.js";
import { recordContentView } from "../../lib/contentStore.js";
import ContentCard from "./ContentCard.jsx";
import ContentRenderer from "./ContentRenderer.jsx";

function updateMeta(item) {
  const title = `${item.title}｜PinPrompt 拼好词`;
  const description = item.summary || "PinPrompt AIGC 学习内容";
  document.title = title;

  function setMeta(selector, attribute, value) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement(attribute === "property" ? "meta" : attribute === "rel" ? "link" : "meta");
      if (attribute === "property") element.setAttribute("property", selector.match(/\[property="(.+)"\]/)?.[1] || "");
      if (attribute === "name") element.setAttribute("name", selector.match(/\[name="(.+)"\]/)?.[1] || "");
      if (attribute === "rel") element.setAttribute("rel", "canonical");
      document.head.appendChild(element);
    }
    element.setAttribute(attribute === "rel" ? "href" : "content", value);
  }

  setMeta('meta[name="description"]', "name", description);
  setMeta('meta[property="og:title"]', "property", title);
  setMeta('meta[property="og:description"]', "property", description);
  setMeta('link[rel="canonical"]', "rel", `${window.location.origin}${getContentUrl(item)}`);
}

function LearningPathBody({ item, navigate }) {
  const modules = getModulesByPath(item.id);
  return (
    <div className="learning-path-modules">
      {modules.map((module) => {
        const knowledge = getKnowledgeByModule(module.id);
        return (
          <section key={module.id}>
            <div className="learning-path-modules__number">{module.number}</div>
            <div>
              <h2>{module.title}</h2>
              <p>{module.summary}</p>
              {knowledge.length ? (
                <div className="learning-path-modules__items">
                  {knowledge.map((entry) => (
                    <button key={entry.id} onClick={() => navigate(getContentUrl(entry))} type="button">
                      <span>{entry.title}</span>
                      <small>{entry.readTime}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <span className="learning-path-modules__pending">内容将在后续逐步发布</span>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function ContentDetailPage({
  favoriteIds,
  onToast,
  onToggleFavorite,
  type,
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const item = getContentBySlug(type, slug);

  useEffect(() => {
    if (!item) return;
    recordContentView(item);
    updateMeta(item);
  }, [item]);

  if (!item) {
    return (
      <section className="modular-not-found">
        <strong>404</strong>
        <h1>没有找到这篇内容</h1>
        <p>链接可能已经修改，或者内容尚未发布。</p>
        <button onClick={() => navigate(CONTENT_TYPES[type]?.listPath || "/")} type="button">返回栏目</button>
      </section>
    );
  }

  const related = getRelatedContent(item, 3);
  const adjacent = getAdjacentContent(item);
  const favorite = favoriteIds.includes(item.id);

  return (
    <article className={`modular-detail modular-detail--${item.type}`}>
      <button className="modular-detail__back" onClick={() => navigate(CONTENT_TYPES[item.type].listPath)} type="button">
        ← 返回{CONTENT_TYPES[item.type].label}
      </button>

      <header className="modular-detail__hero">
        <div className="modular-detail__crumbs">
          <span>{CONTENT_TYPES[item.type].label}</span>
          <span>{item.category}</span>
          <span>{item.level}</span>
        </div>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <div className="modular-detail__facts">
          <span>{item.readTime}</span>
          <span>更新于 {item.updatedAt}</span>
          <span>版本 {item.version}</span>
          {item.tools.map((tool) => <span key={tool}>{tool}</span>)}
        </div>
        <button
          className={`modular-favorite-button${favorite ? " is-favorite" : ""}`}
          onClick={() => onToggleFavorite(item.id)}
          type="button"
        >
          {favorite ? "★ 已收藏" : "☆ 收藏内容"}
        </button>
      </header>

      <div className="modular-detail__layout">
        <main>
          {item.type === "learningPath" ? (
            <LearningPathBody item={item} navigate={navigate} />
          ) : (
            <ContentRenderer markdown={item.markdown} onToast={onToast} />
          )}
        </main>
        <aside className="modular-detail__rail">
          <strong>内容信息</strong>
          <dl>
            <div><dt>分类</dt><dd>{item.category}</dd></div>
            <div><dt>难度</dt><dd>{item.level}</dd></div>
            <div><dt>阅读</dt><dd>{item.readTime}</dd></div>
            <div><dt>版本</dt><dd>{item.version}</dd></div>
          </dl>
          {item.tags.length ? (
            <div className="modular-detail__rail-tags">
              {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          ) : null}
        </aside>
      </div>

      {related.length ? (
        <section className="modular-related">
          <div>
            <h2>继续探索</h2>
            <p>与当前内容相关的知识、工具和模板。</p>
          </div>
          <div className="modular-content-grid">
            {related.map((entry) => (
              <ContentCard
                favorite={favoriteIds.includes(entry.id)}
                item={entry}
                key={entry.id}
                onNavigate={navigate}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      ) : null}

      {(adjacent.previous || adjacent.next) ? (
        <nav className="modular-adjacent" aria-label="上一篇和下一篇">
          {adjacent.previous ? (
            <button onClick={() => navigate(getContentUrl(adjacent.previous))} type="button">
              <small>上一篇</small>
              <span>{adjacent.previous.title}</span>
            </button>
          ) : <span />}
          {adjacent.next ? (
            <button onClick={() => navigate(getContentUrl(adjacent.next))} type="button">
              <small>下一篇</small>
              <span>{adjacent.next.title}</span>
            </button>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}
