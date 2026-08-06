import { useEffect, useMemo, useState } from "react";
import PromptCardGrid from "./PromptCardGrid.jsx";
import PromptFilterBar from "./PromptFilterBar.jsx";
import PromptInspector from "./PromptInspector.jsx";
import PromptSearchBar from "./PromptSearchBar.jsx";
import PromptSidebar from "./PromptSidebar.jsx";
import WorkflowCardGrid from "./WorkflowCardGrid.jsx";
import WorkflowEditorModal from "./WorkflowEditorModal.jsx";
import WorkflowRunner from "./WorkflowRunner.jsx";
import { buildPromptOutput } from "../lib/platformAdapter.js";
import {
  getVariableFieldsForContent,
  loadWorkflows,
  resolveVariantContent,
  saveWorkflows,
} from "../lib/storage.js";

const VIEW_COPY = {
  library: ["提示词库", "查找、填写并复制可直接使用的提示词。"],
  workflows: ["工作流", "把多条提示词串成一个连续创作流程。"],
  favorites: ["收藏夹", "集中查看你标记过的提示词与工作流。"],
  recent: ["最近使用", "从上一次创作继续，不必重新查找。"],
};

function applyVariables(content, variables, values) {
  return (variables || []).reduce((result, variable) => {
    const value = values[variable.key] ?? variable.defaultValue ?? "";
    if (!value) return result;
    return result
      .replaceAll(`{${variable.key}}`, value)
      .replaceAll(`{{${variable.key}}}`, value);
  }, content || "");
}

function workflowText(workflow, values) {
  return [
    `# ${workflow.title}`,
    ...(workflow.steps || []).map((step, index) =>
      `## ${String(index + 1).padStart(2, "0")} ${step.title}\n${applyVariables(step.promptTemplate, workflow.variables, values)}`
    ),
  ].join("\n\n");
}

export default function PromptStudioPage({
  currentUser,
  prompts,
  projects,
  syncState,
  onBack,
  onCopyPrompt,
  onCopyText,
  onEditPrompt,
  onNewPrompt,
  onTogglePromptFavorite,
  onLogout,
  onToast,
}) {
  const [currentView, setCurrentView] = useState("library");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || null);
  const [activePlatform, setActivePlatform] = useState("通用版");
  const [outputMode, setOutputMode] = useState("adapted");
  const [promptVariables, setPromptVariables] = useState({});
  const [workflows, setWorkflows] = useState(() => loadWorkflows());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [workflowVariables, setWorkflowVariables] = useState({});
  const [editingWorkflow, setEditingWorkflow] = useState(undefined);

  const visibleWorkflows = useMemo(
    () => workflows.filter((workflow) => !workflow.userId || workflow.userId === currentUser.id),
    [currentUser.id, workflows]
  );

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId) || null,
    [prompts, selectedPromptId]
  );
  const selectedWorkflow = useMemo(
    () => visibleWorkflows.find((workflow) => workflow.id === selectedWorkflowId) || null,
    [selectedWorkflowId, visibleWorkflows]
  );

  const filteredPrompts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return prompts
      .filter((prompt) => {
        if (currentView === "favorites" && !prompt.favorite) return false;
        if (currentView === "recent" && !prompt.lastUsedAt) return false;
        if (category !== "all" && prompt.type !== category) return false;
        if (platform !== "all" && !(prompt.platforms || []).includes(platform)) return false;
        if (selectedProjectId && !(prompt.projectIds || []).includes(selectedProjectId)) return false;
        if (!keyword) return true;
        return [
          prompt.title,
          prompt.content,
          ...(prompt.platforms || []),
          ...(prompt.taskTags || []),
          ...(prompt.effectTags || []),
        ].some((value) => String(value || "").toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        if (currentView === "recent") return new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0);
        return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
      });
  }, [category, currentView, platform, prompts, query, selectedProjectId]);

  const filteredWorkflows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return visibleWorkflows.filter((workflow) => {
      if (currentView === "favorites" && !workflow.favorite) return false;
      if (currentView === "recent" && !workflow.lastUsedAt) return false;
      if (selectedProjectId && workflow.projectId !== selectedProjectId) return false;
      if (!keyword) return true;
      return [workflow.title, workflow.description, ...(workflow.platforms || []), ...(workflow.tags || [])]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
    });
  }, [currentView, query, selectedProjectId, visibleWorkflows]);

  const counts = useMemo(() => ({
    all: prompts.length,
    image: prompts.filter((item) => item.type === "image").length,
    video: prompts.filter((item) => item.type === "video").length,
    text: prompts.filter((item) => item.type === "text").length,
    workflow: prompts.filter((item) => item.type === "workflow").length,
  }), [prompts]);

  const sidebarCounts = useMemo(() => ({
    all: prompts.length,
    fragments: 0,
    workflows: visibleWorkflows.length,
    favorites: prompts.filter((item) => item.favorite).length + visibleWorkflows.filter((item) => item.favorite).length,
    recent: prompts.filter((item) => item.lastUsedAt).length + visibleWorkflows.filter((item) => item.lastUsedAt).length,
  }), [prompts, visibleWorkflows]);

  const platformContent = selectedPrompt ? resolveVariantContent(selectedPrompt, activePlatform) : "";
  const variableFields = selectedPrompt
    ? getVariableFieldsForContent(selectedPrompt, platformContent)
    : [];

  useEffect(() => {
    if (!prompts.length) {
      setSelectedPromptId(null);
      return;
    }
    if (!selectedPromptId || !prompts.some((prompt) => prompt.id === selectedPromptId)) {
      setSelectedPromptId(prompts[0].id);
    }
  }, [prompts, selectedPromptId]);

  useEffect(() => {
    if (!selectedPrompt) return;
    setActivePlatform(selectedPrompt.platforms?.[0] || "通用版");
    setPromptVariables({});
    setOutputMode("adapted");
  }, [selectedPrompt?.id]);

  useEffect(() => {
    if (!visibleWorkflows.length) return;
    if (!selectedWorkflowId || !visibleWorkflows.some((item) => item.id === selectedWorkflowId)) {
      setSelectedWorkflowId(visibleWorkflows[0].id);
    }
  }, [selectedWorkflowId, visibleWorkflows]);

  useEffect(() => {
    setSelectedStepId(selectedWorkflow?.steps?.[0]?.id || null);
    setWorkflowVariables({});
  }, [selectedWorkflow?.id]);

  function changeView(view) {
    setCurrentView(view);
    setQuery("");
    setCategory("all");
    setPlatform("all");
    if (view === "workflows") setSelectedWorkflowId(visibleWorkflows[0]?.id || null);
  }

  function finalPromptText() {
    if (!selectedPrompt) return "";
    if (outputMode === "original") return applyVariables(platformContent, variableFields, promptVariables);
    return buildPromptOutput(
      selectedPrompt,
      activePlatform,
      Object.fromEntries(variableFields.map((field) => [field.key, promptVariables[field.key] ?? field.defaultValue ?? ""])),
      "adapted"
    );
  }

  function updateWorkflows(mutator) {
    setWorkflows((current) => {
      const next = mutator(current);
      saveWorkflows(next);
      return next;
    });
  }

  function markWorkflowUsed(workflowId) {
    updateWorkflows((current) => current.map((workflow) =>
      workflow.id === workflowId
        ? { ...workflow, usedCount: (workflow.usedCount || 0) + 1, lastUsedAt: new Date().toISOString() }
        : workflow
    ));
  }

  function copyWorkflowStep(workflowId, stepId) {
    const workflow = workflows.find((item) => item.id === workflowId);
    const step = workflow?.steps?.find((item) => item.id === stepId);
    if (!workflow || !step) return;
    onCopyText(applyVariables(step.promptTemplate, workflow.variables, workflowVariables), "已复制当前步骤");
    markWorkflowUsed(workflowId);
  }

  function copyFullWorkflow(workflowId) {
    const workflow = workflows.find((item) => item.id === workflowId);
    if (!workflow) return;
    onCopyText(workflowText(workflow, workflowVariables), "已复制完整工作流");
    markWorkflowUsed(workflowId);
  }

  function saveWorkflow(workflow) {
    const nextWorkflow = { ...workflow, userId: workflow.userId || currentUser.id };
    updateWorkflows((current) => current.some((item) => item.id === nextWorkflow.id)
      ? current.map((item) => item.id === nextWorkflow.id ? nextWorkflow : item)
      : [nextWorkflow, ...current]);
    setSelectedWorkflowId(nextWorkflow.id);
    setEditingWorkflow(undefined);
    onToast("工作流已保存");
  }

  function deleteWorkflow(workflowId) {
    updateWorkflows((current) => current.filter((item) => item.id !== workflowId));
    setSelectedWorkflowId(null);
    setEditingWorkflow(undefined);
    onToast("工作流已删除");
  }

  const meta = VIEW_COPY[currentView] || VIEW_COPY.library;
  const showWorkflowAssets = currentView === "workflows";
  const showMixedAssets = currentView === "favorites" || currentView === "recent";

  return (
    <div className="prompt-studio-site app-shell">
      <PromptSidebar
        currentUser={currentUser}
        currentView={currentView}
        onBackToLearning={onBack}
        onExport={() => {}}
        onImport={() => {}}
        onLogout={onLogout}
        onProjectSelect={(projectId) => {
          setSelectedProjectId(projectId);
          setCurrentView("library");
        }}
        onViewChange={changeView}
        navItems={[
          { id: "library", label: "提示词库", count: sidebarCounts.all },
          { id: "workflows", label: "工作流", count: sidebarCounts.workflows },
          { id: "favorites", label: "收藏夹", count: sidebarCounts.favorites },
          { id: "recent", label: "最近使用", count: sidebarCounts.recent },
        ]}
        projects={projects}
        promptCounts={sidebarCounts}
        selectedProjectId={selectedProjectId}
        showDataActions={false}
      />

      <main className="workspace studio-workspace">
        <section className="workspace-main">
          <header className="studio-header">
            <div>
              <span>PINPROMPT CREATION STUDIO</span>
              <h1>{meta[0]}</h1>
              <p>{meta[1]}</p>
            </div>
            <div className="studio-header__actions">
              <span className={`studio-sync studio-sync--${syncState}`}>
                <i />{syncState === "loading" ? "正在同步" : syncState === "error" ? "本地可用" : "云端已同步"}
              </span>
              <button
                className="primary-button studio-create-button"
                onClick={showWorkflowAssets ? () => setEditingWorkflow(null) : onNewPrompt}
                type="button"
              >
                {showWorkflowAssets ? "＋ 新建工作流" : "＋ 新建提示词"}
              </button>
            </div>
          </header>

          <PromptSearchBar
            hint={showWorkflowAssets ? "支持按主题、平台和标签搜索" : "支持按平台、场景、效果和标签搜索"}
            onChange={setQuery}
            placeholder={showWorkflowAssets ? "搜索工作流，例如：汽车广告、九宫格分镜、视频转场" : undefined}
            value={query}
          />

          {!showWorkflowAssets ? (
            <PromptFilterBar
              counts={counts}
              onCategoryChange={setCategory}
              onPlatformChange={setPlatform}
              selectedCategory={category}
              selectedPlatform={platform}
            />
          ) : null}

          {selectedProjectId ? (
            <div className="studio-project-filter">
              <span>项目：{projects.find((project) => project.id === selectedProjectId)?.name || "已选项目"}</span>
              <button onClick={() => setSelectedProjectId("")} type="button">清除</button>
            </div>
          ) : null}

          {showWorkflowAssets ? (
            <WorkflowCardGrid
              onSelect={setSelectedWorkflowId}
              onStart={(workflowId) => {
                setSelectedWorkflowId(workflowId);
                markWorkflowUsed(workflowId);
              }}
              onToggleFavorite={(workflowId) => updateWorkflows((current) => current.map((item) =>
                item.id === workflowId ? { ...item, favorite: !item.favorite } : item
              ))}
              selected={selectedWorkflowId}
              workflows={filteredWorkflows}
            />
          ) : (
            <>
              <PromptCardGrid
                onCopy={(promptId) => {
                  const prompt = prompts.find((item) => item.id === promptId);
                  if (prompt) onCopyPrompt(prompt, prompt.content, "已复制提示词");
                }}
                onSelect={setSelectedPromptId}
                onToggleFavorite={onTogglePromptFavorite}
                onUse={setSelectedPromptId}
                prompts={filteredPrompts}
                selectedPromptId={selectedPromptId}
              />
              {showMixedAssets && filteredWorkflows.length ? (
                <section className="studio-secondary-assets">
                  <div className="section-title">{currentView === "favorites" ? "收藏的工作流" : "最近使用的工作流"}</div>
                  <WorkflowCardGrid
                    onSelect={(id) => { setSelectedWorkflowId(id); setCurrentView("workflows"); }}
                    onStart={(id) => { setSelectedWorkflowId(id); setCurrentView("workflows"); markWorkflowUsed(id); }}
                    onToggleFavorite={(id) => updateWorkflows((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item))}
                    selected={selectedWorkflowId}
                    workflows={filteredWorkflows}
                  />
                </section>
              ) : null}
            </>
          )}
        </section>

        {showWorkflowAssets ? (
          <WorkflowRunner
            onCopyAll={copyFullWorkflow}
            onCopyStep={copyWorkflowStep}
            onEdit={(workflow) => setEditingWorkflow(workflow)}
            onSelectStep={setSelectedStepId}
            onToggleFavorite={(id) => updateWorkflows((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item))}
            onVariableChange={(key, value) => setWorkflowVariables((current) => ({ ...current, [key]: value }))}
            stepId={selectedStepId}
            variableValues={workflowVariables}
            workflow={selectedWorkflow}
          />
        ) : (
          <PromptInspector
            activePlatform={activePlatform}
            onCopy={() => selectedPrompt && onCopyPrompt(selectedPrompt, finalPromptText(), "已复制当前提示词")}
            onCopyMarkdown={() => selectedPrompt && onCopyPrompt(selectedPrompt, `# ${selectedPrompt.title}\n\n${finalPromptText()}`, "已复制 Markdown")}
            onEdit={onEditPrompt}
            onOutputModeChange={setOutputMode}
            onPlatformChange={(nextPlatform) => { setActivePlatform(nextPlatform); setPromptVariables({}); }}
            onToggleFavorite={onTogglePromptFavorite}
            onUse={() => selectedPrompt && onCopyPrompt(selectedPrompt, finalPromptText(), "已记录到最近使用")}
            onVariableChange={(key, value) => setPromptVariables((current) => ({ ...current, [key]: value }))}
            outputMode={outputMode}
            prompt={selectedPrompt}
            variableFields={variableFields}
            variableValues={promptVariables}
          />
        )}
      </main>

      {editingWorkflow !== undefined ? (
        <WorkflowEditorModal
          onClose={() => setEditingWorkflow(undefined)}
          onDelete={deleteWorkflow}
          onSave={saveWorkflow}
          projects={projects}
          workflow={editingWorkflow}
        />
      ) : null}
    </div>
  );
}
