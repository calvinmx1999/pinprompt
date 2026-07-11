import { PLATFORM_OPTIONS, TYPE_OPTIONS } from "../lib/storage.js";

export default function PromptFilterBar({
  selectedCategory,
  selectedPlatform,
  counts,
  onCategoryChange,
  onPlatformChange,
  showCategories = true,
}) {
  return (
    <div className="filter-bar">
      {showCategories ? (
        <div className="filter-group">
          {TYPE_OPTIONS.map((item) => (
            <button
              key={item.id}
              className={`filter-chip${selectedCategory === item.id ? " is-active" : ""}`}
              onClick={() => onCategoryChange(item.id)}
              type="button"
            >
              {item.label}
              <span>{counts[item.id] ?? 0}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="filter-group filter-group--platform">
        {PLATFORM_OPTIONS.filter((item) => item !== "通用版").map((platform) => (
          <button
            key={platform}
            className={`filter-pill${selectedPlatform === platform ? " is-active" : ""}`}
            onClick={() => onPlatformChange(selectedPlatform === platform ? "all" : platform)}
            type="button"
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
}
