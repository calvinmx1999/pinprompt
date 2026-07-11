import WorkflowCard from "./WorkflowCard.jsx";

export default function WorkflowCardGrid(props) {
  const {
    workflows,
    selected,
    emptyTitle = "没有找到匹配的工作流",
    emptyBody = "换个主题、平台或标签再试试。",
  } = props;

  if (!workflows.length) {
    return (
      <div className="empty-grid">
        <div className="empty-grid__title">{emptyTitle}</div>
        <div className="empty-grid__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="workflow-grid">
      {workflows.map((workflow) => (
        <WorkflowCard {...props} key={workflow.id} selected={selected === workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}
