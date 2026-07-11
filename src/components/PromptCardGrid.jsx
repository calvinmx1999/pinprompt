import PromptCard from "./PromptCard.jsx";

export default function PromptCardGrid(props) {
  const {
    prompts,
    selectedPromptId,
    checkedPromptIds = [],
    emptyTitle = "没有找到匹配的提示词",
    emptyBody = "换个创作意图、平台或类型再试试。",
  } = props;

  if (!prompts.length) {
    return (
      <div className="empty-grid">
        <div className="empty-grid__title">{emptyTitle}</div>
        <div className="empty-grid__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="prompt-grid">
      {prompts.map((prompt) => (
        <PromptCard
          {...props}
          key={prompt.id}
          prompt={prompt}
          selected={selectedPromptId === prompt.id}
          checked={checkedPromptIds.includes(prompt.id)}
        />
      ))}
    </div>
  );
}
