export default function AdvancedFilterPanel({
  filters,
  projects,
  onChange,
  onReset,
}) {
  return (
    <div className="advanced-panel">
      <div className="advanced-panel__grid">
        <label>
          <span>项目</span>
          <select value={filters.projectId} onChange={(event) => onChange("projectId", event.target.value)}>
            <option value="">全部项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>最少使用次数</span>
          <input
            min="0"
            type="number"
            value={filters.minUsedCount}
            onChange={(event) => onChange("minUsedCount", event.target.value)}
          />
        </label>

        <label className="advanced-checkbox">
          <input
            checked={filters.favoriteOnly}
            type="checkbox"
            onChange={(event) => onChange("favoriteOnly", event.target.checked)}
          />
          <span>只看收藏</span>
        </label>

        <label className="advanced-checkbox">
          <input
            checked={filters.hasVariables}
            type="checkbox"
            onChange={(event) => onChange("hasVariables", event.target.checked)}
          />
          <span>有变量</span>
        </label>

        <label className="advanced-checkbox">
          <input
            checked={filters.hasVariants}
            type="checkbox"
            onChange={(event) => onChange("hasVariants", event.target.checked)}
          />
          <span>有平台专属版本</span>
        </label>

        <label>
          <span>创建时间起</span>
          <input type="date" value={filters.createdFrom} onChange={(event) => onChange("createdFrom", event.target.value)} />
        </label>

        <label>
          <span>创建时间止</span>
          <input type="date" value={filters.createdTo} onChange={(event) => onChange("createdTo", event.target.value)} />
        </label>

        <label>
          <span>更新时间起</span>
          <input type="date" value={filters.updatedFrom} onChange={(event) => onChange("updatedFrom", event.target.value)} />
        </label>

        <label>
          <span>更新时间止</span>
          <input type="date" value={filters.updatedTo} onChange={(event) => onChange("updatedTo", event.target.value)} />
        </label>
      </div>

      <div className="advanced-panel__actions">
        <button className="text-button" onClick={onReset} type="button">
          清空筛选
        </button>
      </div>
    </div>
  );
}
