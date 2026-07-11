export default function LearningFilterBar({
  selectedDirection,
  selectedScenario,
  selectedTool,
  directions,
  scenarios,
  tools,
  onDirectionChange,
  onScenarioChange,
  onToolChange,
}) {
  return (
    <div className="filter-bar learning-filter-bar">
      <div className="filter-group">
        <button
          className={`filter-pill${selectedDirection === "all" ? " is-active" : ""}`}
          onClick={() => onDirectionChange("all")}
          type="button"
        >
          全部方向
        </button>
        {directions.map((direction) => (
          <button
            key={direction}
            className={`filter-pill${selectedDirection === direction ? " is-active" : ""}`}
            onClick={() => onDirectionChange(selectedDirection === direction ? "all" : direction)}
            type="button"
          >
            {direction}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <button
          className={`filter-pill${selectedScenario === "all" ? " is-active" : ""}`}
          onClick={() => onScenarioChange("all")}
          type="button"
        >
          全部场景
        </button>
        {scenarios.map((scenario) => (
          <button
            key={scenario}
            className={`filter-pill${selectedScenario === scenario ? " is-active" : ""}`}
            onClick={() => onScenarioChange(selectedScenario === scenario ? "all" : scenario)}
            type="button"
          >
            {scenario}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <button
          className={`filter-pill${selectedTool === "all" ? " is-active" : ""}`}
          onClick={() => onToolChange("all")}
          type="button"
        >
          全部工具
        </button>
        {tools.map((tool) => (
          <button
            key={tool}
            className={`filter-pill${selectedTool === tool ? " is-active" : ""}`}
            onClick={() => onToolChange(selectedTool === tool ? "all" : tool)}
            type="button"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}
