import { useEffect, useMemo, useState } from "react";
import {
  getVariableFieldsForContent,
  loadInterfaceTheme,
  resolveVariantContent,
  saveInterfaceTheme,
} from "../lib/storage.js";
import ProjectEditorModal from "./ProjectEditorModal.jsx";
import "../promptArchive.css";

const CATEGORY_META = {
  image: { label: "图片", short: "图", className: "image" },
  video: { label: "视频", short: "影", className: "video" },
  text: { label: "文本", short: "文", className: "text" },
  music: { label: "音乐", short: "音", className: "music" },
  workflow: { label: "工作流", short: "流", className: "workflow" },
};

const CATEGORY_ORDER = ["image", "video", "text", "music", "workflow"];
const TAB_POSITIONS = ["10%", "14%", "8%", "16%", "11%", "15%", "9%", "13%"];
const JITTER = ["-3px", "2px", "-2px", "3px", "-1px", "1px", "-3px", "2px"];
const LABEL_POSITIONS = ["8%", "18%", "11%", "22%", "7%", "20%", "13%", "24%"];
const PROJECT_COLORS = ["#c8a06b", "#d69a93", "#8fb6a0", "#a9a2d6", "#d4ad55"];
const THEME_OPTIONS = [
  { id: "paper", label: "纸张", icon: "☼" },
  { id: "macaron", label: "马卡龙", icon: "◉" },
  { id: "night", label: "夜间", icon: "◐" },
];

function promptCategory(prompt) {
  const type = String(prompt?.type || "text").toLowerCase();
  if (type === "audio" || type === "music") return "music";
  if (type === "flow" || type === "workflow") return "workflow";
  return CATEGORY_META[type] ? type : "text";
}

function projectIdsForPrompt(prompt) {
  if (Array.isArray(prompt?.projectIds)) return prompt.projectIds;
  return prompt?.projectId ? [prompt.projectId] : [];
}

function fillVariables(content, fields, values) {
  return (fields || []).reduce((result, field) => {
    const value = values[field.key] ?? field.defaultValue ?? "";
    if (!value) return result;
    return result
      .replaceAll(`{{${field.key}}}`, value)
      .replaceAll(`{${field.key}}`, value);
  }, content || "");
}

function promptSummary(prompt) {
  return prompt?.description || prompt?.content || "打开档案查看完整提示词。";
}

function ArchiveLogo() {
  return (
    <div className="archive-brand__logo" aria-hidden="true">
      <span>拼</span>
    </div>
  );
}

export default function PromptStudioPage({
  currentUser,
  prompts,
  projects,
  syncState,
  onBack,
  onCopyPrompt,
  onCreateProject,
  onEditPrompt,
  onNewPrompt,
  onTogglePromptFavorite,
  onLogout,
  onToast,
}) {
  const [view, setView] = useState("library");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openPromptId, setOpenPromptId] = useState(null);
  const [activePlatform, setActivePlatform] = useState("通用版");
  const [variableValues, setVariableValues] = useState({});
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [runningIndex, setRunningIndex] = useState(-1);
  const [theme, setTheme] = useState(() => loadInterfaceTheme());

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === openPromptId) || null,
    [openPromptId, prompts]
  );

  const projectPrompts = useMemo(() => {
    if (!selectedProjectId) return [];
    return prompts.filter((prompt) => projectIdsForPrompt(prompt).includes(selectedProjectId));
  }, [prompts, selectedProjectId]);

  const visiblePrompts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return prompts
      .filter((prompt) => {
        if (view === "recent" && !prompt.lastUsedAt) return false;
        if (category !== "all" && promptCategory(prompt) !== category) return false;
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
        if (view === "recent") return new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0);
        return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
      });
  }, [category, prompts, query, view]);

  const groupedPrompts = useMemo(
    () => CATEGORY_ORDER.map((key) => ({
      key,
      items: visiblePrompts.filter((prompt) => promptCategory(prompt) === key),
    })).filter((group) => group.items.length),
    [visiblePrompts]
  );

  const counts = useMemo(() => ({
    all: prompts.length,
    image: prompts.filter((prompt) => promptCategory(prompt) === "image").length,
    video: prompts.filter((prompt) => promptCategory(prompt) === "video").length,
    text: prompts.filter((prompt) => promptCategory(prompt) === "text").length,
    music: prompts.filter((prompt) => promptCategory(prompt) === "music").length,
    workflow: prompts.filter((prompt) => promptCategory(prompt) === "workflow").length,
  }), [prompts]);

  const platformContent = selectedPrompt
    ? resolveVariantContent(selectedPrompt, activePlatform)
    : "";
  const variableFields = selectedPrompt
    ? getVariableFieldsForContent(selectedPrompt, platformContent)
    : [];
  const finalContent = fillVariables(platformContent, variableFields, variableValues);

  useEffect(() => {
    if (!selectedPrompt) return;
    setActivePlatform(selectedPrompt.platforms?.[0] || "通用版");
    setVariableValues({});
  }, [selectedPrompt?.id]);

  useEffect(() => {
    if (!openPromptId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenPromptId(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [openPromptId]);

  useEffect(() => {
    if (runningIndex < 0) return undefined;
    if (runningIndex >= projectPrompts.length) {
      setRunningIndex(-1);
      onToast("项目档案已按顺序展开");
      return undefined;
    }
    const timer = window.setTimeout(() => setRunningIndex((index) => index + 1), 620);
    return () => window.clearTimeout(timer);
  }, [onToast, projectPrompts.length, runningIndex]);

  useEffect(() => {
    const savedTheme = saveInterfaceTheme(theme);
    document.documentElement.dataset.pinpromptTheme = savedTheme;
  }, [theme]);

  function showLibrary(nextView = "library") {
    setView(nextView);
    setSelectedProjectId("");
    setCategory("all");
    setQuery("");
  }

  function showProject(projectId) {
    setSelectedProjectId(projectId);
    setView("project");
    setQuery("");
  }

  function createProject(project) {
    const nextProject = onCreateProject(project);
    if (!nextProject) return;
    setShowProjectEditor(false);
    setProjectsCollapsed(false);
    showProject(nextProject.id);
  }

  function openDossier(prompt) {
    setOpenPromptId(prompt.id);
  }

  function copyPrompt(prompt, message = "已复制提示词") {
    onCopyPrompt(prompt, prompt.id === selectedPrompt?.id ? finalContent : prompt.content, message);
  }

  const activeProject = projects.find((project) => project.id === selectedProjectId);
  const syncLabel = syncState === "loading" ? "正在同步" : syncState === "error" ? "本地可用" : "云端已同步";

  return (
    <div className={`prompt-archive prompt-archive--${theme}`}>
      <div className="archive-grain" />
      <aside className="archive-side">
        <button className="archive-back" onClick={onBack} type="button">← 返回 PinPrompt 学习站</button>
        <button className="archive-brand" onClick={() => showLibrary()} type="button">
          <ArchiveLogo />
          <span>
            <strong>Pin<em>Prompt</em></strong>
            <small>提示词档案库</small>
          </span>
        </button>

        <div className="archive-group-title">导航</div>
        <button className={`archive-nav-item${view === "library" ? " active" : ""}`} onClick={() => showLibrary()} type="button">
          <span>提示词库</span><span className="archive-count">{prompts.length}</span>
        </button>
        <button className={`archive-nav-item${view === "recent" ? " active" : ""}`} onClick={() => showLibrary("recent")} type="button">
          <span>最近使用</span><span className="archive-count">{prompts.filter((prompt) => prompt.lastUsedAt).length}</span>
        </button>

        <div className="archive-project-title-row">
          <button className={`archive-group-title archive-project-heading${projectsCollapsed ? " collapsed" : ""}`} onClick={() => setProjectsCollapsed((value) => !value)} type="button">
            <span className="archive-caret">▾</span><span>项目</span>
          </button>
          <button aria-label="新建项目" className="archive-project-add" onClick={() => setShowProjectEditor(true)} title="新建项目" type="button">＋</button>
        </div>
        <div className={`archive-project-list${projectsCollapsed ? " collapsed" : ""}`}>
          {projects.map((project, index) => (
            <button
              className={`archive-project${selectedProjectId === project.id ? " active" : ""}`}
              key={project.id}
              onClick={() => showProject(project.id)}
              style={{ "--project-color": project.color || PROJECT_COLORS[index % PROJECT_COLORS.length] }}
              type="button"
            >
              <i style={{ background: project.color || PROJECT_COLORS[index % PROJECT_COLORS.length] }} />
              <span>{project.name}</span>
              <small>{prompts.filter((prompt) => projectIdsForPrompt(prompt).includes(project.id)).length}</small>
            </button>
          ))}
        </div>

        <div aria-label="界面主题" className="archive-theme-switch" role="group">
          {THEME_OPTIONS.map((option) => (
            <button
              aria-label={`${option.label}主题`}
              aria-pressed={theme === option.id}
              className={theme === option.id ? "active" : ""}
              key={option.id}
              onClick={() => setTheme(option.id)}
              title={`${option.label}主题`}
              type="button"
            >
              <span aria-hidden="true">{option.icon}</span>
              <small>{option.label}</small>
            </button>
          ))}
        </div>

        <div className="archive-account">
          <div className="archive-avatar">{String(currentUser.name || currentUser.email || "拼").slice(0, 1).toUpperCase()}</div>
          <span><strong>{currentUser.name || "PinPrompt 用户"}</strong><small>{currentUser.email || "已登录"}</small></span>
          <button onClick={onLogout} type="button">退出</button>
        </div>
      </aside>

      <main className="archive-main">
        {view !== "project" ? (
          <section className="archive-library-view">
            <header className="archive-topbar">
              <div>
                <span className="archive-eyebrow">PINPROMPT ARCHIVE STUDIO</span>
                <h1>{view === "recent" ? "最近使用" : "提示词库"}</h1>
                <p>{view === "recent" ? "从最近打开过的档案继续创作。" : "查找、填写并复制可直接使用的提示词。"}</p>
              </div>
              <div className="archive-top-actions">
                <span className={`archive-sync archive-sync--${syncState}`}><i />{syncLabel}</span>
                <button className="archive-new-button" onClick={onNewPrompt} type="button">＋ 新建提示词</button>
              </div>
            </header>

            <label className="archive-search">
              <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2"/></svg>
              <input onChange={(event) => setQuery(event.target.value)} placeholder="搜索创作意图，例如：汽车广告、人像修图、九宫格分镜、可灵转场" value={query} />
            </label>

            <div className="archive-chips" role="group" aria-label="提示词类型筛选">
              {["all", ...CATEGORY_ORDER].map((key) => (
                <button className={`archive-chip${category === key ? " active" : ""}`} key={key} onClick={() => setCategory(key)} type="button">
                  {key === "all" ? "全部" : CATEGORY_META[key].label}<span>{counts[key]}</span>
                </button>
              ))}
            </div>

            {groupedPrompts.length ? (
              <div className="archive-drawer">
                {groupedPrompts.map((group, groupIndex) => (
                  <div className="archive-drawer-group" key={group.key}>
                    {groupIndex ? (
                      <div className="archive-divider flip" style={{ "--tab-x": TAB_POSITIONS[groupIndex % TAB_POSITIONS.length] }}>
                        <span>{CATEGORY_META[group.key].label}<b>{String(group.items.length).padStart(3, "0")}</b></span>
                      </div>
                    ) : null}
                    {group.items.map((prompt, index) => {
                      const meta = CATEGORY_META[group.key];
                      const absoluteIndex = visiblePrompts.findIndex((item) => item.id === prompt.id);
                      return (
                        <article
                          className={`archive-file archive-file--${meta.className}${index % 2 ? " flip" : ""}`}
                          key={prompt.id}
                          onClick={() => openDossier(prompt)}
                          style={{
                            "--jx": JITTER[absoluteIndex % JITTER.length],
                            "--label-x": LABEL_POSITIONS[index % LABEL_POSITIONS.length],
                            "--tab-x": TAB_POSITIONS[absoluteIndex % TAB_POSITIONS.length],
                            "--z": 100 + absoluteIndex,
                          }}
                        >
                          <div className="archive-file-head">
                            <span className="archive-file-heading">
                              <b>{String(absoluteIndex + 1).padStart(3, "0")}</b>
                              <strong>{prompt.title}</strong>
                            </span>
                            <span className="archive-file-hint">悬停预览 · 点击查看档案</span>
                          </div>
                          <div className="archive-file-body">
                            <div className="archive-file-body__inner">
                              <div className="archive-pills"><span>{meta.label} · {prompt.platforms?.[0] || "通用版"}</span></div>
                              <p>{promptSummary(prompt)}</p>
                              <div className="archive-prompt-preview">{prompt.content}</div>
                              <div className="archive-file-actions">
                                <button onClick={(event) => { event.stopPropagation(); copyPrompt(prompt); }} type="button">复制</button>
                                <button className="primary" onClick={(event) => { event.stopPropagation(); openDossier(prompt); }} type="button">使用</button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="archive-empty"><span>▱</span><strong>没有找到相关档案</strong><p>换一个关键词或筛选条件试试。</p></div>
            )}
            <div className="archive-drawer-base"><span>PinPrompt 的提示词抽屉</span></div>
          </section>
        ) : (
          <section className="archive-project-view" style={{ "--project-color": activeProject?.color || "#B7E0FF" }}>
            <header className="archive-topbar archive-topbar--wide">
              <div>
                <span className="archive-eyebrow">PINPROMPT PROJECT ARCHIVE</span>
                <h1>{activeProject?.name || "项目"}</h1>
                <p>{projectPrompts.length} 个档案 · 点击档案查看完整提示词</p>
              </div>
              <div className="archive-top-actions">
                <button className="archive-outline-button" onClick={onNewPrompt} type="button">＋ 新建档案</button>
                <button className="archive-new-button" disabled={!projectPrompts.length || runningIndex >= 0} onClick={() => setRunningIndex(0)} type="button">▶ 运行流程</button>
              </div>
            </header>
            {projectPrompts.length ? (
              <div className="archive-accordion">
                {projectPrompts.map((prompt, index) => {
                  const meta = CATEGORY_META[promptCategory(prompt)];
                  return (
                    <article className={`archive-step archive-file--${meta.className}${runningIndex === index ? " running" : ""}`} key={prompt.id} onClick={() => openDossier(prompt)}>
                      <span className="archive-step__number">{String(index + 1).padStart(2, "0")}</span>
                      <h2>{prompt.title}</h2>
                      <div className="archive-pills"><span>{meta.label} · {prompt.platforms?.[0] || "通用版"}</span></div>
                      <p>{promptSummary(prompt)}</p>
                      <div className="archive-step__actions">
                        <button onClick={(event) => { event.stopPropagation(); copyPrompt(prompt); }} type="button">复制</button>
                        <button className="primary" onClick={(event) => { event.stopPropagation(); openDossier(prompt); }} type="button">查看档案</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="archive-empty"><span>▱</span><strong>这个项目还没有档案</strong><p>编辑提示词时，可以把它加入这个项目。</p><button onClick={onNewPrompt} type="button">新建第一条提示词</button></div>
            )}
            <div className="archive-project-base"><span>{activeProject?.name || "项目"} · ARCHIVE</span></div>
          </section>
        )}
      </main>

      {selectedPrompt ? (
        <div className="archive-dossier-mask show" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenPromptId(null); }}>
          <section aria-labelledby="archive-dossier-title" aria-modal="true" className={`archive-dossier archive-file--${promptCategory(selectedPrompt)}`} role="dialog">
            <div className="archive-dossier-folder"><span>PINPROMPT 档案</span></div>
            <div className="archive-dossier-sheet archive-dossier-sheet--back">
              <span>使用建议 · TIPS</span>
              <p>先选择目标平台，再填写变量。保留未填写的变量占位符，方便之后继续调整。</p>
            </div>
            <div className="archive-dossier-sheet archive-dossier-sheet--front">
              <span className="archive-paperclip">⌇</span><span className="archive-tape" />
              <button aria-label="关闭档案" className="archive-dossier-close" onClick={() => setOpenPromptId(null)} type="button">×</button>
              <div className="archive-dossier-head">
                <span>{CATEGORY_META[promptCategory(selectedPrompt)].label} · {activePlatform}</span>
                <b>NO.{String(prompts.findIndex((prompt) => prompt.id === selectedPrompt.id) + 1).padStart(3, "0")}</b>
                <button className={selectedPrompt.favorite ? "favorite active" : "favorite"} onClick={() => onTogglePromptFavorite(selectedPrompt.id)} type="button">{selectedPrompt.favorite ? "★" : "☆"}</button>
              </div>
              <h2 id="archive-dossier-title">{selectedPrompt.title}</h2>
              <p className="archive-dossier-description">{promptSummary(selectedPrompt)}</p>
              <div className="archive-platforms">
                {["通用版", ...(selectedPrompt.platforms || []).filter((item) => item !== "通用版")].map((item) => (
                  <button className={activePlatform === item ? "active" : ""} key={item} onClick={() => { setActivePlatform(item); setVariableValues({}); }} type="button">{item}</button>
                ))}
              </div>
              {variableFields.length ? (
                <div className="archive-variables">
                  {variableFields.map((field) => (
                    <label key={field.key}><span>{field.label || field.key}</span><input onChange={(event) => setVariableValues((values) => ({ ...values, [field.key]: event.target.value }))} placeholder={field.placeholder || `{${field.key}}`} value={variableValues[field.key] || ""} /></label>
                  ))}
                </div>
              ) : null}
              <div className="archive-dossier-prompt">{finalContent}</div>
              <div className="archive-dossier-actions">
                <button className="primary" onClick={() => copyPrompt(selectedPrompt, "已复制当前提示词")} type="button">复制提示词</button>
                <button onClick={() => { setOpenPromptId(null); onEditPrompt(selectedPrompt); }} type="button">编辑</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {showProjectEditor ? (
        <ProjectEditorModal
          onClose={() => setShowProjectEditor(false)}
          onSave={createProject}
        />
      ) : null}
    </div>
  );
}
