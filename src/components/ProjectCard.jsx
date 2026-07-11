export default function ProjectCard({
  project,
  promptCount,
  workflowCount,
  selected,
  onSelect,
  onEdit,
}) {
  return (
    <article
      className={`project-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(project.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(project.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="project-card__head">
        <div className="project-card__dot" style={{ background: project.color }} />
        <button
          className="text-button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(project);
          }}
          type="button"
        >
          编辑
        </button>
      </div>

      <h3 className="project-card__title">{project.name}</h3>
      <p className="project-card__description">
        {project.desc || "把相关提示词和工作流集中在一个项目里，方便持续创作。"}
      </p>

      <div className="project-card__stats">
        <span className="meta-chip meta-chip--platform">{promptCount} 条提示词</span>
        <span className="meta-chip meta-chip--platform">{workflowCount} 个工作流</span>
      </div>

      <div className="project-card__footer">
        <span className="prompt-card__usage">
          最近更新 {new Date(project.updatedAt || Date.now()).toLocaleDateString("zh-CN")}
        </span>
      </div>
    </article>
  );
}
