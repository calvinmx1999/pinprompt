export default function PromptSearchBar({
  value,
  onChange,
  placeholder = "搜索创作意图，例如：汽车广告、人像修图、九宫格分镜、可灵转场",
  hint = "支持按平台、场景、效果搜索",
}) {
  return (
    <div className="search-panel">
      <label className="search-input">
        <span className="search-input__icon">⌕</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      <p className="search-panel__hint">{hint}</p>
    </div>
  );
}
