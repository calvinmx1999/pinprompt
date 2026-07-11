import EmptyPromptState from "./EmptyPromptState.jsx";

export default function ProjectInspector({
  project,
  promptCount,
  workflowCount,
  onEdit,
  onOpenPrompts,
  onOpenWorkflows,
}) {
  if (!project) {
    return (
      <EmptyPromptState
        body="右侧会展示项目说明、包含的提示词与工作流数量，并支持继续编辑或进入对应内容。"
        title="选择一个项目，查看它的创作资产"
      />
    );
  }

  return (
    <aside className="inspector">
      <div className="inspector__section">
        <div className="inspector__header">
          <div>
            <div className="inspector__meta-row">
              <span className="meta-chip meta-chip--blue">项目</span>
              <span className="meta-chip meta-chip--platform">{promptCount} 条提示词</span>
              <span className="meta-chip meta-chip--platform">{workflowCount} 个工作流</span>
            </div>
            <h2>{project.name}</h2>
          </div>
          <span className="project-card__dot project-card__dot--large" style={{ background: project.color }} />
        </div>
        <div className="inspector__notice">
          {project.desc || "给这个项目补一段说明，后面筛选提示词和工作流时会更清楚。"}
        </div>
      </div>

      <div className="inspector__section">
        <div className="section-title">项目统计</div>
        <div className="project-inspector__stats">
          <div className="project-inspector__stat">
            <strong>{promptCount}</strong>
            <span>提示词</span>
          </div>
          <div className="project-inspector__stat">
            <strong>{workflowCount}</strong>
            <span>工作流</span>
          </div>
        </div>
      </div>

      <div className="inspector__section inspector__section--actions">
        <div className="action-row">
          <button className="primary-button" onClick={() => onOpenPrompts(project.id)} type="button">
            查看提示词
          </button>
          <button className="secondary-button" onClick={() => onOpenWorkflows(project.id)} type="button">
            查看工作流
          </button>
        </div>
        <div className="action-row action-row--minor">
          <button className="text-button" onClick={() => onEdit(project)} type="button">
            编辑项目
          </button>
        </div>
      </div>
    </aside>
  );
}
