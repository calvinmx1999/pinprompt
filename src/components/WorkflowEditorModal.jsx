import { useState } from "react";
import {
  createEmptyWorkflow,
  extractVariableKeys,
  inferVariableDefinitions,
  PLATFORM_OPTIONS,
} from "../lib/storage.js";

function parseCommaList(value) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyVariableRow() {
  return { key: "", label: "", placeholder: "", defaultValue: "" };
}

function emptyStepRow(order) {
  return {
    id: `workflow_step_${Date.now()}_${order}`,
    title: "",
    description: "",
    promptTemplate: "",
    linkedPromptId: "",
    platform: "",
    order,
  };
}

export default function WorkflowEditorModal({ workflow, projects, onClose, onDelete, onSave }) {
  const current = workflow || createEmptyWorkflow();
  const [title, setTitle] = useState(current.title || "");
  const [description, setDescription] = useState(current.description || "");
  const [platforms, setPlatforms] = useState((current.platforms || []).join("，"));
  const [tags, setTags] = useState((current.tags || []).join("，"));
  const [projectId, setProjectId] = useState(current.projectId || "");
  const [favorite, setFavorite] = useState(Boolean(current.favorite));
  const [variables, setVariables] = useState(current.variables?.length ? current.variables : []);
  const [steps, setSteps] = useState(
    current.steps?.length ? current.steps : [emptyStepRow(1)]
  );
  const [errors, setErrors] = useState({});

  function updateVariable(index, patch) {
    setVariables((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function updateStep(index, patch) {
    setSteps((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function togglePlatform(platform) {
    const currentList = parseCommaList(platforms);
    const nextList = currentList.includes(platform)
      ? currentList.filter((item) => item !== platform)
      : [...currentList, platform];
    setPlatforms(nextList.join("，"));
  }

  function handleIdentifyVariables() {
    const existingKeys = new Set(variables.map((item) => String(item.key || "").trim()).filter(Boolean));
    const inferred = inferVariableDefinitions({
      variables,
      steps,
    });
    const additions = inferred.filter((item) => !existingKeys.has(item.key));
    if (additions.length) {
      setVariables((rows) => [...rows, ...additions]);
    }
  }

  function moveStep(index, direction) {
    setSteps((rows) => {
      const next = [...rows];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= rows.length) return rows;
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next.map((step, stepIndex) => ({ ...step, order: stepIndex + 1 }));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "请填写工作流名称";
    if (!steps.some((step) => step.title.trim() && step.promptTemplate.trim())) {
      nextErrors.steps = "请至少填写一个有效步骤";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const cleanedSteps = steps
      .map((step, index) => ({
        ...step,
        title: String(step.title || "").trim(),
        description: String(step.description || "").trim(),
        promptTemplate: String(step.promptTemplate || "").trim(),
        platform: String(step.platform || "").trim(),
        order: index + 1,
      }))
      .filter((step) => step.title && step.promptTemplate);

    const cleanedVariables = inferVariableDefinitions({
      variables: variables
        .map((variable) => ({
          key: String(variable.key || "").trim(),
          label: String(variable.label || "").trim(),
          placeholder: String(variable.placeholder || "").trim(),
          defaultValue: String(variable.defaultValue || "").trim(),
        }))
        .filter((variable) => variable.key),
      steps: cleanedSteps,
    });

    onSave({
      ...current,
      title: title.trim(),
      description: description.trim(),
      platforms: parseCommaList(platforms),
      tags: parseCommaList(tags),
      projectId,
      favorite,
      variables: cleanedVariables,
      steps: cleanedSteps,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="editor-modal" onClick={(event) => event.stopPropagation()}>
        <div className="editor-modal__head">
          <div>
            <h3>{workflow ? "编辑工作流" : "新建工作流"}</h3>
            <p>把多条提示词组织成一个固定步骤式的创作流程。</p>
          </div>
          <button onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <label>
            <span>工作流名称</span>
            <input
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((currentErrors) => ({ ...currentErrors, title: "" }));
              }}
              placeholder="例如：汽车广告片工作流"
              value={title}
            />
            {errors.title ? <div className="field-error">{errors.title}</div> : null}
          </label>

          <label>
            <span>工作流描述</span>
            <textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="例如：从产品卖点到分镜、图片提示词、视频提示词和封面文案。"
              rows={4}
              value={description}
            />
          </label>

          <label>
            <span>所属项目</span>
            <select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
              <option value="">无项目</option>
              {(projects || []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>适用平台</h4>
                <p>选择这个工作流常用的平台，可多选。</p>
              </div>
            </div>
            <div className="platform-picker">
              {PLATFORM_OPTIONS.filter((platform) => platform !== "通用版").map((platform) => {
                const checked = parseCommaList(platforms).includes(platform);
                return (
                  <label className={`platform-picker__item${checked ? " is-active" : ""}`} key={platform}>
                    <input checked={checked} onChange={() => togglePlatform(platform)} type="checkbox" />
                    <span>{platform}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <label>
            <span>标签</span>
            <input
              onChange={(event) => setTags(event.target.value)}
              placeholder="汽车广告、分镜、转场"
              value={tags}
            />
          </label>

          <label className="editor-checkbox">
            <input checked={favorite} onChange={(event) => setFavorite(event.target.checked)} type="checkbox" />
            <span>默认收藏这个工作流</span>
          </label>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>变量设置</h4>
                <p>变量会同步替换到所有步骤的提示词模板中。</p>
              </div>
              <div className="editor-section__actions">
                <button className="secondary-button" onClick={handleIdentifyVariables} type="button">
                  从步骤中识别变量
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setVariables((rows) => [...rows, emptyVariableRow()])}
                  type="button"
                >
                  ＋ 添加变量
                </button>
              </div>
            </div>

            <div className="editor-list">
              {variables.map((variable, index) => (
                <div className="editor-list__card" key={`${variable.key || "variable"}-${index}`}>
                  <div className="editor-form__row editor-form__row--triple">
                    <label>
                      <span>变量 key</span>
                      <input
                        onChange={(event) => updateVariable(index, { key: event.target.value })}
                        placeholder="scene"
                        value={variable.key || ""}
                      />
                    </label>
                    <label>
                      <span>显示名称</span>
                      <input
                        onChange={(event) => updateVariable(index, { label: event.target.value })}
                        placeholder="场景"
                        value={variable.label || ""}
                      />
                    </label>
                    <label>
                      <span>默认值</span>
                      <input
                        onChange={(event) => updateVariable(index, { defaultValue: event.target.value })}
                        placeholder="可选"
                        value={variable.defaultValue || ""}
                      />
                    </label>
                  </div>
                  <div className="editor-form__row editor-form__row--wide">
                    <label>
                      <span>占位提示</span>
                      <input
                        onChange={(event) => updateVariable(index, { placeholder: event.target.value })}
                        placeholder="例如：雨夜高架桥"
                        value={variable.placeholder || ""}
                      />
                    </label>
                    <button
                      className="text-button editor-remove"
                      onClick={() => setVariables((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                      type="button"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>步骤设置</h4>
                <p>固定步骤式工作流，不做复杂拖拽，先用上移 / 下移完成排序。</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => setSteps((rows) => [...rows, emptyStepRow(rows.length + 1)])}
                type="button"
              >
                ＋ 添加步骤
              </button>
            </div>

            {errors.steps ? <div className="field-error">{errors.steps}</div> : null}

            <div className="editor-list">
              {steps.map((step, index) => (
                <div className="editor-list__card" key={step.id}>
                  <div className="editor-list__toolbar">
                    <strong>步骤 {String(index + 1).padStart(2, "0")}</strong>
                    <div className="editor-section__actions">
                      <button
                        className="text-button"
                        disabled={index === 0}
                        onClick={() => moveStep(index, -1)}
                        type="button"
                      >
                        上移
                      </button>
                      <button
                        className="text-button"
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(index, 1)}
                        type="button"
                      >
                        下移
                      </button>
                      <button
                        className="text-button editor-remove"
                        onClick={() => setSteps((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <div className="editor-form__row">
                    <label>
                      <span>步骤标题</span>
                      <input
                        onChange={(event) => updateStep(index, { title: event.target.value })}
                        placeholder="例如：产品卖点拆解"
                        value={step.title || ""}
                      />
                    </label>
                    <label>
                      <span>平台（可选）</span>
                      <select
                        onChange={(event) => updateStep(index, { platform: event.target.value })}
                        value={step.platform || ""}
                      >
                        <option value="">不限平台</option>
                        {PLATFORM_OPTIONS.filter((platform) => platform !== "通用版").map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    <span>步骤说明</span>
                    <input
                      onChange={(event) => updateStep(index, { description: event.target.value })}
                      placeholder="例如：先分析产品亮点"
                      value={step.description || ""}
                    />
                  </label>

                  <label>
                    <span>提示词模板</span>
                    <textarea
                      onChange={(event) => updateStep(index, { promptTemplate: event.target.value })}
                      placeholder="请输入这一阶段的提示词模板，可使用 {scene} 等变量"
                      rows={5}
                      value={step.promptTemplate || ""}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="editor-actions">
            {workflow ? (
              <button
                className="text-button editor-delete"
                onClick={() => {
                  if (window.confirm("确认删除这个工作流吗？此操作不可撤销。")) {
                    onDelete(workflow.id);
                  }
                }}
                type="button"
              >
                删除工作流
              </button>
            ) : (
              <span />
            )}
            <button className="secondary-button" onClick={onClose} type="button">
              取消
            </button>
            <button className="primary-button" type="submit">
              保存工作流
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
