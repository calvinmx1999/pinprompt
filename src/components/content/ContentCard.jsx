import { CONTENT_TYPES, getContentUrl } from "../../lib/contentLoader.js";

const TILE_IMAGES = [
  "/kimi-home/tiles/k1101.png",
  "/kimi-home/tiles/k1102.png",
  "/kimi-home/tiles/k1103.png",
  "/kimi-home/tiles/k1104.png",
  "/kimi-home/tiles/k1105.png",
];

export default function ContentCard({ favorite, index = 0, item, onNavigate, onToggleFavorite }) {
  const contentLabel = CONTENT_TYPES[item.type]?.label || "内容";
  const serial = String(index + 1).padStart(3, "0");

  if (item.type === "tool") {
    return (
      <article className="archive-tool-entry">
        <span>T-{String(index + 1).padStart(2, "0")}</span>
        <button onClick={() => onNavigate(getContentUrl(item))} type="button">
          <strong>{item.title}</strong>
          <small>{item.category}</small>
        </button>
        <p>{item.summary}</p>
        <div>
          {item.tools.slice(0, 2).map((tool) => <span key={tool}>{tool}</span>)}
        </div>
        <button
          aria-label={favorite ? `取消收藏${item.title}` : `收藏${item.title}`}
          className={favorite ? "is-favorite" : ""}
          onClick={() => onToggleFavorite(item.id)}
          type="button"
        >
          {favorite ? "★" : "☆"}
        </button>
        <button onClick={() => onNavigate(getContentUrl(item))} type="button">查看 →</button>
      </article>
    );
  }

  return (
    <article className={`archive-content-card archive-content-card--${item.type}`}>
      <button className="archive-content-card__visual" onClick={() => onNavigate(getContentUrl(item))} type="button">
        <img alt="" loading="lazy" src={TILE_IMAGES[index % TILE_IMAGES.length]} />
        <span>NO.{serial}</span>
        <b>{item.level || "入门"}</b>
      </button>

      <div className="archive-content-card__body">
        <div className="archive-content-card__meta">
          <span>{contentLabel}</span>
          <button
            aria-label={favorite ? `取消收藏${item.title}` : `收藏${item.title}`}
            className={favorite ? "is-favorite" : ""}
            onClick={() => onToggleFavorite(item.id)}
            type="button"
          >
            {favorite ? "★" : "☆"}
          </button>
        </div>

        <button className="archive-content-card__title" onClick={() => onNavigate(getContentUrl(item))} type="button">
          {item.title}
        </button>
        <p>{item.summary}</p>

        <div className="archive-content-card__tags">
          <span>{item.category}</span>
          {item.tools.slice(0, 2).map((tool) => <span key={tool}>{tool}</span>)}
        </div>

        <footer>
          <span>{item.readTime || item.level}</span>
          <time>{item.updatedAt || item.publishedAt}</time>
          <button onClick={() => onNavigate(getContentUrl(item))} type="button">调阅 →</button>
        </footer>
      </div>
    </article>
  );
}
