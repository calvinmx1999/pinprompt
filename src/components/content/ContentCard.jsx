import { CONTENT_TYPES, getContentUrl } from "../../lib/contentLoader.js";

export default function ContentCard({ favorite, item, onNavigate, onToggleFavorite }) {
  return (
    <article className={`modular-content-card modular-content-card--${item.type}`}>
      {item.cover ? (
        <button className="modular-content-card__cover" onClick={() => onNavigate(getContentUrl(item))} type="button">
          <img alt="" loading="lazy" src={item.cover} />
        </button>
      ) : null}
      <div className="modular-content-card__body">
        <div className="modular-content-card__meta">
          <span>{CONTENT_TYPES[item.type]?.label || "内容"}</span>
          <button
            aria-label={favorite ? "取消收藏" : "收藏"}
            className={favorite ? "is-favorite" : ""}
            onClick={() => onToggleFavorite(item.id)}
            type="button"
          >
            {favorite ? "★" : "☆"}
          </button>
        </div>
        <button className="modular-content-card__title" onClick={() => onNavigate(getContentUrl(item))} type="button">
          {item.title}
        </button>
        <p>{item.summary}</p>
        <div className="modular-content-card__tags">
          <span>{item.category}</span>
          {item.tools.slice(0, 2).map((tool) => <span key={tool}>{tool}</span>)}
        </div>
        <footer>
          <span>{item.readTime || item.level}</span>
          <time>{item.updatedAt || item.publishedAt}</time>
        </footer>
      </div>
    </article>
  );
}
