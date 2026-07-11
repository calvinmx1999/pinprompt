export default function PromptControlBar({
  sortMode,
  onSortChange,
  onToggleAdvanced,
  onToggleBatch,
  advancedOpen,
  batchMode,
  batchCount,
}) {
  return (
    <div className="control-bar">
      <div className="control-bar__group">
        <label className="control-select">
          <span>排序方式</span>
          <select onChange={(event) => onSortChange(event.target.value)} value={sortMode}>
            <option value="updatedAt">最近更新</option>
            <option value="lastUsedAt">最近使用</option>
            <option value="usedCount">使用最多</option>
            <option value="favorite">收藏优先</option>
            <option value="title">标题 A-Z</option>
            <option value="createdAt">创建时间</option>
          </select>
        </label>
      </div>

      <div className="control-bar__group control-bar__group--actions">
        <button className={`secondary-button${advancedOpen ? " is-active" : ""}`} onClick={onToggleAdvanced} type="button">
          高级筛选
        </button>
        <button className={`secondary-button${batchMode ? " is-active" : ""}`} onClick={onToggleBatch} type="button">
          {batchMode ? `退出批量（${batchCount}）` : "批量管理"}
        </button>
      </div>
    </div>
  );
}
