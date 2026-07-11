import ProjectCard from "./ProjectCard.jsx";

export default function ProjectCardGrid({
  projects,
  selectedProjectId,
  promptCounts,
  workflowCounts,
  onSelect,
  onEdit,
  emptyTitle = "还没有项目，先新建一个吧。",
  emptyBody = "项目会把提示词和工作流串起来，方便你按主题持续创作。",
}) {
  if (!projects.length) {
    return (
      <div className="empty-grid">
        <div className="empty-grid__title">{emptyTitle}</div>
        <div className="empty-grid__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          onEdit={onEdit}
          onSelect={onSelect}
          project={project}
          promptCount={promptCounts[project.id] || 0}
          selected={selectedProjectId === project.id}
          workflowCount={workflowCounts[project.id] || 0}
        />
      ))}
    </div>
  );
}
