import { useNavigate } from "react-router-dom";
import {
  getContentById,
  getContentByType,
  getContentUrl,
  getFeaturedContent,
  getLearningPaths,
} from "../../lib/contentLoader.js";
import ContentCard from "./ContentCard.jsx";

function HomeSection({ children, description, onMore, title }) {
  if (!children) return null;
  return (
    <section className="modular-home-section">
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {onMore ? <button onClick={onMore} type="button">查看全部 →</button> : null}
      </header>
      {children}
    </section>
  );
}

export default function ContentHomePage({
  favoriteIds,
  history,
  onLoginRequest,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const paths = getLearningPaths();
  const knowledge = getFeaturedContent("knowledge", 3);
  const workflows = getFeaturedContent("workflow", 3);
  const tools = getFeaturedContent("tool", 4);
  const frontier = getContentByType("frontier").slice(0, 3);
  const recentlyViewed = history.map((entry) => getContentById(entry.itemId)).filter(Boolean).slice(0, 3);
  const favorites = favoriteIds.map(getContentById).filter(Boolean).slice(0, 3);

  function renderCards(items) {
    if (!items.length) return null;
    return (
      <div className="modular-content-grid">
        {items.map((item) => (
          <ContentCard
            favorite={favoriteIds.includes(item.id)}
            item={item}
            key={item.id}
            onNavigate={navigate}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="modular-home">
      <section className="modular-home-hero">
        <div className="modular-home-hero__media" />
        <div className="modular-home-hero__shade" />
        <div className="modular-home-hero__content">
          <span>PINPROMPT AIGC LEARNING</span>
          <h1>人人都能参与的<br /><em>AIGC学习平台</em></h1>
          <p>
            从基础知识、工作流和工具指南，到正在发生的AI前沿。
            按需学习，随时查找，让新的AI能力真正进入你的工作和创作。
          </p>
          <div>
            <button onClick={() => navigate("/learn")} type="button">开始探索</button>
            <button onClick={() => navigate("/frontier")} type="button">查看AI前沿</button>
          </div>
        </div>
      </section>

      <section className="modular-home-intro">
        <h2>从一个问题开始，找到知识、工具和可以直接使用的方法。</h2>
        <p>内容按稳定链接发布。你可以自由浏览，也可以收藏备用，下一次从原来的位置继续。</p>
      </section>

      {paths.length ? (
        <HomeSection
          description="按照课程模块建立完整框架，也可以只打开眼前需要的知识点。"
          onMore={() => navigate("/learn")}
          title="AIGC全栈学习路径"
        >
          <div className="modular-path-strip">
            {paths.map((path) => (
              <button key={path.id} onClick={() => navigate(getContentUrl(path))} type="button">
                <img alt="" src={path.cover} />
                <span>
                  <small>{path.readTime}</small>
                  <strong>{path.title}</strong>
                  <p>{path.summary}</p>
                </span>
                <b>查看路径 →</b>
              </button>
            ))}
          </div>
        </HomeSection>
      ) : null}

      <HomeSection
        description="用几分钟弄懂一个概念，再决定要不要继续深入。"
        onMore={() => navigate("/knowledge")}
        title="推荐知识点"
      >
        {renderCards(knowledge)}
      </HomeSection>

      <HomeSection
        description="把复杂任务拆成可以逐项执行和检查的步骤。"
        onMore={() => navigate("/workflows")}
        title="热门工作流"
      >
        {renderCards(workflows)}
      </HomeSection>

      <HomeSection
        description="先了解适合场景、核心能力和限制，再选择工具。"
        onMore={() => navigate("/tools")}
        title="工具速查"
      >
        {renderCards(tools)}
      </HomeSection>

      <HomeSection
        description="解释新概念发生了什么，以及它为什么值得关注。"
        onMore={() => navigate("/frontier")}
        title="最新AI前沿"
      >
        {renderCards(frontier)}
      </HomeSection>

      {recentlyViewed.length ? (
        <HomeSection onMore={() => navigate("/search")} title="最近浏览">
          {renderCards(recentlyViewed)}
        </HomeSection>
      ) : null}

      {favorites.length ? (
        <HomeSection onMore={() => navigate("/favorites")} title="我的收藏">
          {renderCards(favorites)}
        </HomeSection>
      ) : null}

      <section className="modular-home-cta">
        <div>
          <h2>收藏自己的提示词，继续积累创作方法。</h2>
          <p>原账号中的个人提示词仍然独立保存并同步到云端。</p>
        </div>
        <button onClick={onLoginRequest} type="button">进入我的提示词</button>
      </section>
    </div>
  );
}
