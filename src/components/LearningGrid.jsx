import LearningCard from "./LearningCard.jsx";

export default function LearningGrid({
  items,
  selectedItemId,
  emptyTitle,
  emptyBody,
  onSelect,
  onToggleFavorite,
  onCopyPrompt,
}) {
  if (!items.length) {
    return (
      <div className="empty-grid">
        <div className="empty-grid__title">{emptyTitle}</div>
        <div className="empty-grid__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="prompt-grid">
      {items.map((item) => (
        <LearningCard
          key={item.id}
          item={item}
          selected={selectedItemId === item.id}
          onCopyPrompt={onCopyPrompt}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
