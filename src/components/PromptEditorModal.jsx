import { useMemo, useState } from "react";
import {
  createEmptyPrompt,
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

function emptyVariantRow() {
  return { platform: "", content: "" };
}

export default function PromptEditorModal({ prompt, projects, onClose, onDelete, onSave }) {
  const current = prompt || createEmptyPrompt();
  const [title, setTitle] = useState(current.title || "");
  const [content, setContent] = useState(current.content || "");
  const [type, setType] = useState(current.type || "text");
  const [platforms, setPlatforms] = useState((current.platforms || ["通用版"]).join("，"));
  const [taskTags, setTaskTags] = useState((current.taskTags || []).join("，"));
  const [effectTags, setEffectTags] = useState((current.effectTags || []).join("，"));
  const [tags, setTags] = useState((current.tags || []).join("，"));
  const [projectId, setProjectId] = useState(current.projectIds?.[0] || "");
  const [favorite, setFavorite] = useState(Boolean(current.favorite));
  const [errors, setErrors] = useState({});
  const [variables, setVariables] = useState(
    current.variables?.length ? current.variables : inferVariableDefinitions(current)
  );
  const [variants, setVariants] = useState(current.variants?.length ? current.variants : [emptyVariantRow()]);

  const inferredVariables = useMemo(
    () =>
      inferVariableDefinitions({
        content,
        variants,
        variables,
      }),
    [content, variants, variables]
  );

  function updateVariable(index, patch) {
    setVariables((currentRows) =>
      currentRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row))
    );
  }

  function updateVariant(index, patch) {
    setVariants((currentRows) =>
      currentRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row))
    );
  }

  function togglePlatform(platform) {
    const currentList = parseCommaList(platforms);
    const nextList = currentList.includes(platform)
      ? currentList.filter((item) => item !== platform)
      : [...currentList, platform];
    setPlatforms(nextList.join("，"));
  }

  function handleIdentifyVariables() {
    const existingKeys = new Set(variables.map((variable) => String(variable.key || "").trim()).filter(Boolean));
    const nextKeys = Array.from(
      new Set([extractVariableKeys(content), ...variants.map((variant) => extractVariableKeys(variant.content))].flat())
    );
    const additions = nextKeys
      .filter((key) => !existingKeys.has(key))
      .map((key) => ({ key, label: key, placeholder: "", defaultValue: "" }));

    if (additions.length) {
      setVariables((currentRows) => [...currentRows, ...additions]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "请填写标题";
    if (!content.trim()) nextErrors.content = "请填写提示词内容";
    if (!type) nextErrors.type = "请选择类型";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const cleanedVariants = variants
      .map((variant) => ({
        platform: String(variant.platform || "").trim(),
        content: String(variant.content || "").trim(),
      }))
      .filter((variant) => variant.platform && variant.content);

    const mergedVariables = inferVariableDefinitions({
      content,
      variants: cleanedVariants,
      variables: variables
        .map((variable) => ({
          key: String(variable.key || "").trim(),
          label: String(variable.label || "").trim(),
          placeholder: String(variable.placeholder || "").trim(),
          defaultValue: String(variable.defaultValue || "").trim(),
        }))
        .filter((variable) => variable.key),
    });

    const nextPrompt = {
      ...current,
      title: title.trim(),
      content: content.trim(),
      type: type || "text",
      platforms: parseCommaList(platforms).length ? parseCommaList(platforms) : ["通用版"],
      taskTags: parseCommaList(taskTags),
      effectTags: parseCommaList(effectTags),
      tags: parseCommaList(tags),
      projectIds: projectId ? [projectId] : [],
      favorite,
      updatedAt: Date.now(),
      variants: cleanedVariants,
      variables: mergedVariables,
    };

    onSave(nextPrompt);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="editor-modal" onClick={(event) => event.stopPropagation()}>
        <div className="editor-modal__head">
          <div>
            <h3>{prompt ? "编辑提示词" : "新建提示词"}</h3>
            <p>维护通用提示词、变量和平台专属版本，直接为右侧工作台提供数据。</p>
          </div>
          <button onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <label>
            <span>标题</span>
            <input
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((currentErrors) => ({ ...currentErrors, title: "" }));
              }}
              placeholder="例如：汽车广告电影感镜头组"
              required
              value={title}
            />
            {errors.title ? <div className="field-error">{errors.title}</div> : null}
          </label>

          <div className="editor-form__row">
            <label>
              <span>类型</span>
              <select
                onChange={(event) => {
                  setType(event.target.value);
                  setErrors((currentErrors) => ({ ...currentErrors, type: "" }));
                }}
                value={type}
              >
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="text">文本</option>
                <option value="workflow">工作流</option>
              </select>
              {errors.type ? <div className="field-error">{errors.type}</div> : null}
            </label>
            <label>
              <span>所属项目</span>
              <select onChange={(event) => setProjectId(event.target.value ? event.target.value : "")} value={projectId}>
                <option value="">无项目</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>通用提示词内容</span>
            <textarea
              onChange={(event) => {
                setContent(event.target.value);
                setErrors((currentErrors) => ({ ...currentErrors, content: "" }));
              }}
              placeholder="请输入通用提示词，可以使用 {scene}、{style}、{subject} 等变量"
              required
              rows={7}
              value={content}
            />
            {errors.content ? <div className="field-error">{errors.content}</div> : null}
          </label>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>平台</h4>
                <p>选择这条提示词适用的平台，可多选。</p>
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

          <div className="editor-form__row">
            <label>
              <span>任务标签</span>
              <input onChange={(event) => setTaskTags(event.target.value)} placeholder="汽车广告，人像修图" value={taskTags} />
            </label>
            <label>
              <span>效果标签</span>
              <input
                onChange={(event) => setEffectTags(event.target.value)}
                placeholder="电影感，转场，角色一致性"
                value={effectTags}
              />
            </label>
          </div>

          <div className="editor-form__row">
            <label>
              <span>通用标签</span>
              <input onChange={(event) => setTags(event.target.value)} placeholder="便于搜索和筛选" value={tags} />
            </label>
          </div>

          <label className="editor-checkbox">
            <input checked={favorite} onChange={(event) => setFavorite(event.target.checked)} type="checkbox" />
            <span>默认收藏这条提示词</span>
          </label>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>变量设置</h4>
                <p>优先使用你手动填写的变量；未填写时会自动从提示词内容中识别。</p>
              </div>
              <div className="editor-section__actions">
                <button className="secondary-button" onClick={handleIdentifyVariables} type="button">
                  从提示词中识别变量
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setVariables((currentRows) => [...currentRows, emptyVariableRow()])}
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
                      <span>变量名称</span>
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
                      onClick={() =>
                        setVariables((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index))
                      }
                      type="button"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {inferredVariables.length ? (
              <div className="editor-helper">
                自动识别到变量：{inferredVariables.map((item) => item.key).join("、")}
              </div>
            ) : null}
          </section>

          <section className="editor-section">
            <div className="editor-section__head">
              <div>
                <h4>平台专属版本</h4>
                <p>未填写的平台会默认回退到通用提示词。</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => setVariants((currentRows) => [...currentRows, emptyVariantRow()])}
                type="button"
              >
                ＋ 添加平台版本
              </button>
            </div>

            <div className="editor-list">
              {variants.map((variant, index) => (
                <div className="editor-list__card" key={`${variant.platform || "variant"}-${index}`}>
                  <div className="editor-form__row">
                    <label>
                      <span>平台名称</span>
                      <select
                        onChange={(event) => updateVariant(index, { platform: event.target.value })}
                        value={variant.platform || ""}
                      >
                        <option value="">请选择平台</option>
                        {PLATFORM_OPTIONS.filter((platform) => platform !== "通用版").map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="editor-list__actions">
                      <button
                        className="text-button editor-remove"
                        onClick={() =>
                          setVariants((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index))
                        }
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <label>
                    <span>平台专属提示词内容</span>
                    <textarea
                      onChange={(event) => updateVariant(index, { content: event.target.value })}
                      placeholder="请输入该平台专属提示词。如果为空，则默认使用通用提示词。"
                      rows={4}
                      value={variant.content || ""}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="editor-actions">
            {prompt ? (
              <button
                className="text-button editor-delete"
                onClick={() => {
                  if (window.confirm("确认删除这个提示词吗？此操作不可撤销。")) {
                    onDelete(prompt.id);
                  }
                }}
                type="button"
              >
                删除提示词
              </button>
            ) : (
              <span />
            )}
            <button className="secondary-button" onClick={onClose} type="button">
              取消
            </button>
            <button className="primary-button" type="submit">
              保存提示词
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
