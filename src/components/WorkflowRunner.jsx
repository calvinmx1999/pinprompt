import EmptyPromptState from "./EmptyPromptState.jsx";

function applyVariables(content, variables, values) {
  return (variables || []).reduce((accumulator, variable) => {
    const value = values[variable.key] ?? variable.defaultValue ?? "";
    if (value === "") return accumulator;
    return accumulator
      .replaceAll(`{${variable.key}}`, value)
      .replaceAll(`{{${variable.key}}}`, value);
  }, content || "");
}

export default function WorkflowRunner({
  workflow,
  stepId,
  variableValues,
  onVariableChange,
  onSelectStep,
  onCopyStep,
  onCopyAll,
  onEdit,
  onToggleFavorite,
}) {
  if (!workflow) {
    return <EmptyPromptState />;
  }

  const currentStep =
    workflow.steps.find((step) => step.id === stepId) || workflow.steps[0] || null;
  const currentPrompt = currentStep
    ? applyVariables(currentStep.promptTemplate, workflow.variables, variableValues)
    : "";

  return (
    <aside className="inspector workflow-runner">
      <div className="inspector__section">
        <div className="inspector__header">
          <div>
            <div className="inspector__meta-row">
              <span className="meta-chip meta-chip--blue">工作流</span>
              <span className="meta-chip meta-chip--platform">{workflow.steps.length} 个步骤</span>
            </div>
            <h2>{workflow.title}</h2>
            <p className="workflow-runner__description">{workflow.description}</p>
          </div>
          <button
            className={`icon-toggle icon-toggle--solid${workflow.favorite ? " is-active" : ""}`}
            onClick={() => onToggleFavorite(workflow.id)}
            type="button"
          >
            ★
          </button>
        </div>
      </div>

      <div className="inspector__section">
        <div className="section-title">工作流变量</div>
        <div className="inspector__helper">填写后会自动替换到所有步骤的提示词中。</div>
        <div className="variable-form">
          {(workflow.variables || []).map((variable) => (
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
      </div>

      <div className="inspector__section">
        <div className="section-title">工作流步骤</div>
        <div className="workflow-step-list">
          {workflow.steps.map((step, index) => (
            <button
              className={`workflow-step-item${step.id === currentStep?.id ? " is-active" : ""}`}
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              type="button"
            >
              <span className="workflow-step-item__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="workflow-step-item__copy">
                <strong>{step.title}</strong>
                {step.description ? <small>{step.description}</small> : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="inspector__section">
        <div className="section-title">当前步骤提示词</div>
        {currentStep ? (
          <>
            <div className="workflow-step-preview__title">{currentStep.title}</div>
            <pre className="prompt-content">{currentPrompt}</pre>
          </>
        ) : (
          <div className="inspector__placeholder">当前工作流还没有步骤。</div>
        )}
      </div>

      <div className="inspector__section inspector__section--actions">
        <div className="action-row">
          <button
            className="primary-button"
            disabled={!currentStep}
            onClick={() => currentStep && onCopyStep(workflow.id, currentStep.id)}
            type="button"
          >
            复制当前步骤
          </button>
          <button className="secondary-button" onClick={() => onCopyAll(workflow.id)} type="button">
            复制完整工作流
          </button>
        </div>
        <div className="action-row action-row--minor">
          <button className="text-button" onClick={() => onEdit(workflow)} type="button">
            编辑工作流
          </button>
        </div>
      </div>
    </aside>
  );
}
