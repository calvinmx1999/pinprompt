const COURSE_IMAGES = [
  "/v7-assets/v7-07-697f4e15b0.webp",
  "/v7-assets/v7-08-ac7b367ac2.webp",
  "/v7-assets/v7-09-47c35f6905.webp",
];

const GALLERY = [
  { src: "/v7-assets/v7-02-106bd22cb4.webp", label: "AI 海报" },
  { src: "/v7-assets/v7-03-47ce5b3d68.webp", label: "AI 视频" },
  { src: "/v7-assets/v7-04-ade1b34fba.webp", label: "AI 文案" },
  { src: "/v7-assets/v7-05-10c8163e75.webp", label: "提示词优化" },
];

export default function V7HomePage({ items, onOpenItem, onStartLearning, onViewChange }) {
  const paths = items.filter((item) => item.type === "learningPath").slice(0, 3);

  return (
    <div className="v7-home">
      <section className="v7-hero v7-reveal">
        <div className="v7-hero__media" />
        <div className="v7-hero__shade" />
        <div className="v7-hero__content">
          <p>THE HOME FOR PRACTICAL AIGC LEARNING</p>
          <h1>
            从一个想法，
            <br />
            到第一件 <em>AI 作品</em>
          </h1>
          <span>系统课程、实战教程、工具指南和提示词模板，陪你把灵感真正做出来。</span>
          <div className="v7-hero__actions">
            <button onClick={onStartLearning} type="button">免费开始学习 <b>→</b></button>
            <button onClick={() => onViewChange("learningPaths")} type="button">查看系统课程</button>
          </div>
        </div>
      </section>

      <section className="v7-tool-ticker" aria-label="覆盖的 AIGC 工具">
        <div className="v7-tool-ticker__track">
          {[
            "ChatGPT", "Claude", "豆包", "Nano Banana", "即梦", "可灵",
            "Seedance", "Lovart", "Liblib", "Canva", "剪映",
            "ChatGPT", "Claude", "豆包", "Nano Banana", "即梦", "可灵",
          ].map((tool, index) => (
            <span key={`${tool}-${index}`}>{tool}<i>✦</i></span>
          ))}
        </div>
      </section>

      <section className="v7-editorial v7-reveal">
        <div className="v7-section-kicker">WHY PINPROMPT</div>
        <div className="v7-editorial__grid">
          <h2>不只告诉你工具怎么用，<br />更陪你完成一次真实创作。</h2>
          <div>
            <p>课程从创作任务出发，把复杂的 AIGC 方法拆成容易执行的小步骤。</p>
            <p>你会看到真实案例、可复制的提示词、常见错误，以及下一步该怎么改。</p>
            <button onClick={() => onViewChange("cases")} type="button">看看实战教程 →</button>
          </div>
        </div>
      </section>

      <section className="v7-section v7-reveal">
        <div className="v7-section__head">
          <div>
            <div className="v7-section-kicker">START HERE</div>
            <h2>从一条适合你的课程开始</h2>
          </div>
          <button onClick={() => onViewChange("learningPaths")} type="button">查看全部课程 →</button>
        </div>
        <div className="v7-course-grid">
          {paths.map((item, index) => (
            <article className="v7-course-card" key={item.id}>
              <button className="v7-course-card__image" onClick={() => onOpenItem(item)} type="button">
                <img alt="" src={COURSE_IMAGES[index % COURSE_IMAGES.length]} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
              <div className="v7-course-card__body">
                <div><span>{item.level}</span><i>{item.duration}</i></div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <button onClick={() => onOpenItem(item)} type="button">开始这门课 →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="v7-method v7-reveal">
        <div className="v7-section-kicker">HOW IT WORKS</div>
        <h2>一套学完就能动手的方法</h2>
        <div className="v7-method__grid">
          {[
            ["01", "先看清任务", "知道这次要解决什么问题，最后应该交付什么作品。"],
            ["02", "跟着案例做", "按步骤完成一次真实练习，不在抽象概念里打转。"],
            ["03", "对照错误改", "看到常见问题和修改方法，把结果从能用改到更好。"],
            ["04", "收藏继续用", "把有效模板留下来，下一次创作直接从成熟方法开始。"],
          ].map(([num, title, copy]) => (
            <article key={num}>
              <span>{num}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v7-gallery-section v7-reveal">
        <div className="v7-section__head">
          <div>
            <div className="v7-section-kicker">LEARN BY MAKING</div>
            <h2>不是看完就算，而是做出作品</h2>
          </div>
          <p>从文案到海报，从视频到提示词优化，每一次学习都有清晰的产出。</p>
        </div>
        <div className="v7-gallery">
          {GALLERY.map((item) => (
            <figure key={item.src}>
              <img alt={`${item.label}作品示例`} src={item.src} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="v7-community v7-reveal">
        <img alt="创作者共同学习与讨论的场景" src="/v7-assets/v7-06-dd73a90bee.webp" />
        <div>
          <div className="v7-section-kicker">GROW TOGETHER</div>
          <h2>一边学习，一边积累自己的创作方法</h2>
          <p>收藏课程、案例和提示词，把每一次有效尝试都沉淀成下一次能直接复用的经验。</p>
          <button onClick={onStartLearning} type="button">建立我的学习记录 →</button>
        </div>
      </section>

      <section className="v7-final-cta v7-reveal">
        <span>START YOUR FIRST PROJECT</span>
        <h2>今天，就从第一个作品开始。</h2>
        <p>不需要先学会所有工具。选一条课程，跟着完成一次，你就已经开始了。</p>
        <button onClick={onStartLearning} type="button">免费开始学习 →</button>
      </section>
    </div>
  );
}
