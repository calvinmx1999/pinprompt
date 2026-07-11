import EmptyPromptState from "./EmptyPromptState.jsx";
import { platformLink, PLATFORM_OPTIONS } from "../lib/storage.js";
import { buildPromptOutput } from "../lib/platformAdapter.js";

const TYPE_LABEL = {
  image: "图片",
  video: "视频",
  text: "文本",
  workflow: "工作流",
};

function replaceVariables(content, variables, values) {
  return (variables || []).reduce((accumulator, variable) => {
    const replacement = values[variable.key] ?? variable.defaultValue ?? "";
    if (replacement === "") return accumulator;
    return accumulator
      .replaceAll(`{${variable.key}}`, replacement)
      .replaceAll(`{{${variable.key}}}`, replacement);
  }, content || "");
}

export default function PromptInspector({
  prompt,
  activePlatform,
  onPlatformChange,
  variableFields,
  variableValues,
  outputMode,
  onOutputModeChange,
  onVariableChange,
  onCopy,
  onCopyMarkdown,
  onToggleFavorite,
  onEdit,
  onUse,
}) {
  if (!prompt) return <EmptyPromptState />;

  const variant = (prompt.variants || []).find((item) => item.platform === activePlatform);
  const usingFallback = activePlatform !== "通用版" && !variant;
  const platformContent = variant?.content || prompt.content;
  const displayContent =
    outputMode === "original"
      ? replaceVariables(platformContent, variableFields, variableValues)
      : buildPromptOutput(
          prompt,
          activePlatform,
          Object.fromEntries(variableFields.map((item) => [item.key, variableValues[item.key] ?? item.defaultValue ?? ""])),
          "adapted"
        );
  const openPlatformUrl = platformLink(activePlatform);
  const availablePlatforms = PLATFORM_OPTIONS;

  return (
    <aside className="inspector">
      <div className="inspector__section">
        <div className="inspector__header">
          <div>
            <div className="inspector__meta-row">
              <span className="meta-chip meta-chip--blue">{TYPE_LABEL[prompt.type]}</span>
              {(prompt.platforms?.length ? prompt.platforms : ["通用版"]).slice(0, 4).map((platform) => (
                <span className="meta-chip meta-chip--platform" key={platform}>
                  {platform}
                </span>
              ))}
            </div>
            <h2>{prompt.title}</h2>
          </div>
          <button
            className={`icon-toggle icon-toggle--solid${prompt.favorite ? " is-active" : ""}`}
            onClick={() => onToggleFavorite(prompt.id)}
            type="button"
          >
            ★
          </button>
        </div>
        <div className="inspector__platforms">
          {availablePlatforms.map((platform) => (
            <button
              className={`platform-tab${platform === activePlatform ? " is-active" : ""}`}
              key={platform}
              onClick={() => onPlatformChange(platform)}
              type="button"
            >
              {platform}
            </button>
          ))}
        </div>
        {usingFallback ? (
          <div className="inspector__notice">暂无该平台专属版本，当前展示通用提示词</div>
        ) : null}
      </div>

      <div className="inspector__section">
        <div className="inspector__header inspector__header--stack">
          <div className="section-title">{outputMode === "original" ? "原始模板" : "平台适配结果"}</div>
          <div className="inspector__platforms">
            <button className={`platform-tab${outputMode === "adapted" ? " is-active" : ""}`} onClick={() => onOutputModeChange("adapted")} type="button">
              平台适配
            </button>
            <button className={`platform-tab${outputMode === "original" ? " is-active" : ""}`} onClick={() => onOutputModeChange("original")} type="button">
              原始模板
            </button>
          </div>
        </div>
        <pre className="prompt-content">{displayContent}</pre>
      </div>

      <div className="inspector__section">
        <div className="section-title">变量填写</div>
        <div className="inspector__helper">填写后会自动替换提示词中的变量</div>
        {variableFields?.length ? (
          <div className="variable-form">
            {variableFields.map((variable) => (
              <label className="variable-field" key={variable.key}>
                <span>{variable.label}</span>
                <input
                  value={variableValues[variable.key] ?? variable.defaultValue ?? ""}
                  onChange={(event) => onVariableChange(variable.key, event.target.value)}
                  placeholder={variable.placeholder || `填写 ${variable.label}`}
                />
              </label>
            ))}
          </div>
        ) : (
          <div className="inspector__placeholder">这条提示词暂时没有变量，直接复制即可。</div>
        )}
      </div>

      <div className="inspector__section inspector__section--actions">
        <div className="action-row">
          <button className="primary-button" onClick={() => onCopy(prompt.id)} type="button">
            复制提示词
          </button>
          <button className="secondary-button" disabled={!variableFields?.length} type="button">
            填入变量
          </button>
        </div>
        <div className="action-row">
          <button className="secondary-button" disabled type="button">
            转换平台
          </button>
          <button className="secondary-button" disabled type="button">
            套入模板
          </button>
        </div>
        <div className="action-row action-row--minor">
          <button className="text-button" onClick={() => onUse(prompt.id)} type="button">
            最近使用
          </button>
          <button className="text-button" onClick={() => onEdit(prompt)} type="button">
            编辑
          </button>
          <button
            className="text-button"
            onClick={() => onCopyMarkdown(prompt.id)}
            type="button"
          >
            复制为 Markdown
          </button>
          <button
            className="text-button"
            disabled={!openPlatformUrl}
            onClick={() => openPlatformUrl && window.open(openPlatformUrl, "_blank")}
            type="button"
          >
            打开平台
          </button>
        </div>
      </div>
    </aside>
  );
}
