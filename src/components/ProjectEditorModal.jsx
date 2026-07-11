import { useState } from "react";
import { createEmptyProject } from "../lib/storage.js";

const COLOR_OPTIONS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function ProjectEditorModal({ project, onClose, onDelete, onSave }) {
  const current = project || createEmptyProject();
  const [name, setName] = useState(current.name || "");
  const [desc, setDesc] = useState(current.desc || "");
  const [color, setColor] = useState(current.color || COLOR_OPTIONS[0]);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "请填写项目名称";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      ...current,
      name: name.trim(),
      desc: desc.trim(),
      color,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="editor-modal editor-modal--compact" onClick={(event) => event.stopPropagation()}>
        <div className="editor-modal__head">
          <div>
            <h3>{project ? "编辑项目" : "新建项目"}</h3>
            <p>项目不会绑定复杂权限，先把你的提示词和工作流按主题整理好。</p>
          </div>
          <button onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <label>
            <span>项目名称</span>
            <input
              onChange={(event) => {
                setName(event.target.value);
                setErrors((currentErrors) => ({ ...currentErrors, name: "" }));
              }}
              placeholder="例如：汽车广告片"
              value={name}
            />
            {errors.name ? <div className="field-error">{errors.name}</div> : null}
          </label>

          <label>
            <span>项目说明</span>
            <textarea
              onChange={(event) => setDesc(event.target.value)}
              placeholder="例如：可灵转场与 Seedance 氛围镜头的商业广告实验。"
              rows={4}
              value={desc}
            />
          </label>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>项目颜色</h4>
                <p>颜色会用于左侧项目列表和项目卡片识别。</p>
              </div>
            </div>
            <div className="color-picker">
              {COLOR_OPTIONS.map((option) => (
                <button
                  className={`color-swatch${color === option ? " is-active" : ""}`}
                  key={option}
                  onClick={() => setColor(option)}
                  style={{ background: option }}
                  type="button"
                />
              ))}
            </div>
          </section>

          <div className="editor-actions">
            {project ? (
              <button
                className="text-button editor-delete"
                onClick={() => {
                  if (window.confirm("确认删除这个项目吗？相关提示词和工作流不会被删除，只会取消项目归属。")) {
                    onDelete(project.id);
                  }
                }}
                type="button"
              >
                删除项目
              </button>
            ) : (
              <span />
            )}
            <button className="secondary-button" onClick={onClose} type="button">
              取消
            </button>
            <button className="primary-button" type="submit">
              保存项目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
