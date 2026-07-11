export default function EmptyPromptState({
  title = "选择一张提示词卡片，开始创作",
  body = "右侧会展示完整提示词、平台版本、变量区域和复制操作。",
}) {
  return (
    <div className="inspector-empty">
      <div className="inspector-empty__icon">✦</div>
      <div className="inspector-empty__title">{title}</div>
      <div className="inspector-empty__body">{body}</div>
    </div>
  );
}
