import { FRAGMENT_CATEGORY_OPTIONS } from "../lib/storage.js";

export default function PromptAssembler({
  selectedCategory,
  onCategoryChange,
  fragments,
  chosenFragments,
  separator,
  onSeparatorChange,
  onAddFragment,
  onRemoveFragment,
  onMoveFragment,
  onClear,
  onCopy,
  onSaveAsPrompt,
}) {
  const separatorMap = {
    newline: "\n",
    cnComma: "，",
    enComma: ", ",
    paragraph: "\n\n",
  };

  const assembled = chosenFragments.map((item) => item.content).join(separatorMap[separator] || "\n");

  return (
    <>
      <div className="assembler-layout">
        <section className="assembler-panel assembler-panel--categories">
          <div className="assembler-panel__title">片段分类</div>
          <div className="assembler-categories">
            {FRAGMENT_CATEGORY_OPTIONS.map((category) => (
              <button
                key={category.id}
                className={`assembler-category${selectedCategory === category.id ? " is-active" : ""}`}
                onClick={() => onCategoryChange(category.id)}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>

        <section className="assembler-panel assembler-panel--fragments">
          <div className="assembler-panel__title">可选片段</div>
          <div className="assembler-fragment-list">
            {fragments.map((fragment) => (
              <button className="assembler-fragment" key={fragment.id} onClick={() => onAddFragment(fragment)} type="button">
                <strong>{fragment.title}</strong>
                <span>{fragment.content}</span>
              </button>
            ))}
            {!fragments.length ? (
              <div className="empty-grid">
                <div className="empty-grid__title">这个分类下还没有片段</div>
                <div className="empty-grid__body">后面可以继续往片段库里补更细的风格、镜头和参数。</div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <aside className="inspector assembler-result">
        <div className="inspector__section">
          <div className="inspector__header">
            <div>
              <div className="inspector__meta-row">
                <span className="meta-chip meta-chip--blue">拼装器</span>
                <span className="meta-chip meta-chip--platform">{chosenFragments.length} 个片段</span>
              </div>
              <h2>拼装结果</h2>
            </div>
          </div>
        </div>

        <div className="inspector__section">
          <div className="section-title">分隔符</div>
          <div className="inspector__platforms">
            <button className={`platform-tab${separator === "newline" ? " is-active" : ""}`} onClick={() => onSeparatorChange("newline")} type="button">换行</button>
            <button className={`platform-tab${separator === "cnComma" ? " is-active" : ""}`} onClick={() => onSeparatorChange("cnComma")} type="button">中文逗号</button>
            <button className={`platform-tab${separator === "enComma" ? " is-active" : ""}`} onClick={() => onSeparatorChange("enComma")} type="button">英文逗号</button>
            <button className={`platform-tab${separator === "paragraph" ? " is-active" : ""}`} onClick={() => onSeparatorChange("paragraph")} type="button">段落</button>
          </div>
        </div>

        <div className="inspector__section">
          <div className="section-title">已选片段</div>
          <div className="workflow-step-list">
            {chosenFragments.map((fragment, index) => (
              <div className="assembler-chosen" key={`${fragment.id}_${index}`}>
                <div className="assembler-chosen__copy">
                  <strong>{fragment.title}</strong>
                  <small>{fragment.content}</small>
                </div>
                <div className="assembler-chosen__actions">
                  <button className="text-button" disabled={index === 0} onClick={() => onMoveFragment(index, -1)} type="button">上移</button>
                  <button className="text-button" disabled={index === chosenFragments.length - 1} onClick={() => onMoveFragment(index, 1)} type="button">下移</button>
                  <button className="text-button editor-remove" onClick={() => onRemoveFragment(index)} type="button">删除</button>
                </div>
              </div>
            ))}
            {!chosenFragments.length ? <div className="inspector__placeholder">先从左侧选几个片段，把提示词像积木一样拼起来。</div> : null}
          </div>
        </div>

        <div className="inspector__section">
          <div className="section-title">最终结果</div>
          <pre className="prompt-content">{assembled || "还没有拼装内容。"}</pre>
        </div>

        <div className="inspector__section inspector__section--actions">
          <div className="action-row">
            <button className="primary-button" disabled={!chosenFragments.length} onClick={() => onCopy(assembled)} type="button">
              复制最终结果
            </button>
            <button className="secondary-button" disabled={!chosenFragments.length} onClick={() => onSaveAsPrompt(assembled)} type="button">
              保存为提示词
            </button>
          </div>
          <div className="action-row action-row--minor">
            <button className="text-button" disabled={!chosenFragments.length} onClick={onClear} type="button">
              清空全部
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
