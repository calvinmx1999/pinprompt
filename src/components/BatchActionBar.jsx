export default function BatchActionBar({
  selectedCount,
  projects,
  targetProjectId,
  onTargetProjectChange,
  onFavorite,
  onUnfavorite,
  onDelete,
  onExport,
  onMoveProject,
  onAddTag,
}) {
  return (
    <div className="batch-bar">
      <div className="batch-bar__summary">已选择 {selectedCount} 条提示词</div>
      <div className="batch-bar__actions">
        <button className="secondary-button" onClick={onFavorite} type="button">
          批量收藏
        </button>
        <button className="secondary-button" onClick={onUnfavorite} type="button">
          取消收藏
        </button>
        <label className="batch-select">
          <select value={targetProjectId} onChange={(event) => onTargetProjectChange(event.target.value)}>
            <option value="">移动到项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button" disabled={!targetProjectId} onClick={onMoveProject} type="button">
          应用项目
        </button>
        <button className="secondary-button" onClick={onAddTag} type="button">
          批量加标签
        </button>
        <button className="secondary-button" onClick={onExport} type="button">
          批量导出
        </button>
        <button className="secondary-button danger-button" onClick={onDelete} type="button">
          批量删除
        </button>
      </div>
    </div>
  );
}
