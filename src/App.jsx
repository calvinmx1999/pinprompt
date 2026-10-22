import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import PromptEditorModal from "./components/PromptEditorModal.jsx";
import Toast from "./components/Toast.jsx";
import V7Header from "./components/V7Header.jsx";
import OctoberStudioPage from "./components/OctoberStudioPage.jsx";
import ExtensionAuthPage from "./components/ExtensionAuthPage.jsx";
import AccountSettingsPage from "./components/AccountSettingsPage.jsx";
import V7UserPromptLibrary from "./components/V7UserPromptLibrary.jsx";
import ContentDetailPage from "./components/content/ContentDetailPage.jsx";
import ContentHomePage from "./components/content/ContentHomePage.jsx";
import ContentListPage from "./components/content/ContentListPage.jsx";
import ContentStudioPage from "./components/content/ContentStudioPage.jsx";
import NotFoundPage from "./components/content/NotFoundPage.jsx";
import {
  clearCurrentUser,
  ensureThemeSeed,
  loadInterfaceTheme,
  loadCurrentUser,
  loadProjects,
  loadPrompts,
  migrateLegacyData,
  saveCurrentUser,
  saveProjects,
  savePrompts,
} from "./lib/storage.js";
import {
  deleteCloudPrompt,
  deleteCloudProject,
  fetchCloudLibrary,
  getCloudUser,
  signInCloud,
  signOutCloud,
  signUpCloud,
  upsertCloudProjects,
  upsertCloudProject,
  upsertCloudPrompt,
  upsertCloudPrompts,
} from "./lib/cloud.js";
import {
  getContentFavoriteIds,
  getReadingHistory,
  toggleContentFavorite,
} from "./lib/contentStore.js";
import { isContentPreviewEnabled } from "./lib/contentLoader.js";

const LIST_TITLES = {
  "/": "拼好词 PinPrompt｜个人提示词灵感收藏",
  "/learn": "学习路径 - 拼好词 PinPrompt",
  "/knowledge": "知识点 - 拼好词 PinPrompt",
  "/workflows": "工作流 - 拼好词 PinPrompt",
  "/tools": "工具库 - 拼好词 PinPrompt",
  "/frontier": "AI前沿 - 拼好词 PinPrompt",
  "/templates": "提示词模板 - 拼好词 PinPrompt",
  "/favorites": "我的收藏 - 拼好词 PinPrompt",
  "/my-prompts": "我的提示词 - 拼好词 PinPrompt",
  "/studio": "提示词工作台 - 拼好词 PinPrompt",
  "/extension/auth": "授权拼好词 Chrome 扩展 - 拼好词 PinPrompt",
  "/account/settings": "账号设置 - 拼好词 PinPrompt",
  "/search": "搜索 - 拼好词 PinPrompt",
};

const HOME_DESCRIPTION = "拼好词是给 AI 创作者的提示词收藏夹：看到好用的就存下来，按图片、视频、文本、音乐归档，用的时候填空、一键复制。";

const AUTH_RESTORE_TIMEOUT_MS = 12000;

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function setListSeo(pathname) {
  const title = LIST_TITLES[pathname];
  if (!title) return;
  document.title = title;
  const description = pathname === "/"
    ? HOME_DESCRIPTION
    : "PinPrompt 提供AIGC知识、工作流、工具指南、AI前沿和提示词模板。";
  let meta = document.head.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute(
    "href",
    pathname === "/" ? "https://pinprompt.art/" : `${window.location.origin}${pathname}`
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [existingUser, setExistingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncState, setSyncState] = useState("idle");
  const [legacyPrompts, setLegacyPrompts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [userPromptSearch, setUserPromptSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);
  const libraryRevisionRef = useRef(0);
  const cloudWritesRef = useRef({ pending: 0, failed: false });

  useEffect(() => {
    ensureThemeSeed();
    document.documentElement.dataset.pinpromptTheme = loadInterfaceTheme();
    const migrationState = migrateLegacyData();
    const restoredUser = loadCurrentUser() || migrationState.currentUser || null;
    setExistingUser(restoredUser);
    setFavoriteIds(getContentFavoriteIds());
    setHistory(getReadingHistory());

    const localPrompts = loadPrompts();
    const localProjects = loadProjects();
    if (restoredUser) {
      setCurrentUser(restoredUser);
      setLegacyPrompts(localPrompts.filter((prompt) => prompt.userId === restoredUser.id));
      setProjects(localProjects.filter((project) => project.userId === restoredUser.id));
      setSyncState("loading");
    }

    withTimeout(getCloudUser(), AUTH_RESTORE_TIMEOUT_MS, "cloud_restore_timeout")
      .then(async (cloudUser) => {
        if (cloudUser) {
          await withTimeout(
            activateCloudUser(cloudUser, localPrompts, localProjects),
            AUTH_RESTORE_TIMEOUT_MS,
            "cloud_sync_timeout"
          );
        } else if (!restoredUser) {
          clearCurrentUser();
          setExistingUser(null);
          setCurrentUser(null);
          setLegacyPrompts([]);
          setProjects([]);
          setSyncState("idle");
        } else {
          setSyncState("error");
        }
      })
      .catch(() => {
        if (restoredUser) {
          setCurrentUser(restoredUser);
          setLegacyPrompts(localPrompts.filter((prompt) => prompt.userId === restoredUser.id));
          setProjects(localProjects.filter((project) => project.userId === restoredUser.id));
        }
        setSyncState("error");
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    setListSeo(location.pathname);
    setHistory(getReadingHistory());
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (
      authReady &&
      (location.pathname === "/my-prompts" || location.pathname.startsWith("/studio")) &&
      !currentUser
    ) {
      setShowLogin(true);
    }
  }, [authReady, currentUser, location.pathname]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  // The cloud is authoritative, including an intentionally empty library. Refresh
  // when returning from the extension, but never overwrite an in-flight local edit.
  useEffect(() => {
    if (!verifiedUser || syncState !== "ok") return;
    let active = true;
    let refreshing = false;
    async function refresh() {
      if (document.visibilityState === "hidden" || refreshing || cloudWritesRef.current.pending) return;
      const revision = libraryRevisionRef.current;
      refreshing = true;
      try {
        const library = await fetchCloudLibrary(verifiedUser.id);
        if (!active || cloudWritesRef.current.pending || revision !== libraryRevisionRef.current) return;
        const others = list => list.filter(item => item.userId && item.userId !== verifiedUser.id);
        savePrompts([...others(loadPrompts()), ...library.prompts]);
        saveProjects([...others(loadProjects()), ...library.projects]);
        setLegacyPrompts(loadPrompts().filter(item => item.userId === verifiedUser.id));
        setProjects(loadProjects().filter(item => item.userId === verifiedUser.id));
      } catch { /* Keep the current view on a transient refresh failure. */ }
      finally { refreshing = false; }
    }
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [verifiedUser?.id, syncState]);

  const visibleLegacyPrompts = useMemo(() => {
    if (!currentUser) return [];
    return legacyPrompts.filter((prompt) => prompt.userId === currentUser.id);
  }, [currentUser, legacyPrompts]);

  function showToast(message) {
    setToastMessage(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 1800);
  }

  async function copyText(text, successMessage = "已复制提示词") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      showToast(copied ? successMessage : "复制失败，请手动复制");
    }
  }

  function authErrorMessage(error) {
    const message = String(error?.message || "");
    if (/invalid login credentials/i.test(message)) return "邮箱或密码不正确";
    if (/email not confirmed/i.test(message)) return "请先打开邮箱完成账号验证";
    if (/password/i.test(message) && /6/i.test(message)) return "密码至少需要 6 位";
    if (/already registered/i.test(message)) return "该邮箱已经注册，请直接登录";
    if (/failed to fetch|network|cloud_unavailable|abort|timeout|^\{\}$/i.test(message)) {
      return "账号服务暂时不可用，请恢复 Supabase 项目后重试";
    }
    return message || "登录失败，请稍后重试";
  }

  async function activateCloudUser(user, localPrompts = loadPrompts(), localProjects = loadProjects()) {
    setSyncState("loading");
    setVerifiedUser(user);
    const savedUser = saveCurrentUser(user);
    setExistingUser(savedUser);
    setCurrentUser(savedUser);

    try {
      const cloudLibrary = await fetchCloudLibrary(user.id);
      const nextPrompts = cloudLibrary.prompts;
      const nextProjects = cloudLibrary.projects;

      const normalizedPrompts = nextPrompts.map((prompt) => ({ ...prompt, userId: user.id }));
      const normalizedProjects = nextProjects.map((project) => ({ ...project, userId: user.id }));
      const otherUsersPrompts = localPrompts.filter((prompt) => prompt.userId && prompt.userId !== user.id);
      const otherUsersProjects = localProjects.filter((project) => project.userId && project.userId !== user.id);
      savePrompts([...otherUsersPrompts, ...normalizedPrompts]);
      saveProjects([...otherUsersProjects, ...normalizedProjects]);
      setLegacyPrompts(loadPrompts().filter((prompt) => prompt.userId === user.id));
      setProjects(loadProjects().filter((project) => project.userId === user.id));
      setSyncState("ok");
    } catch (error) {
      setLegacyPrompts(localPrompts.filter((prompt) => prompt.userId === user.id));
      setProjects(localProjects.filter((project) => project.userId === user.id));
      setSyncState("error");
      showToast(authErrorMessage(error));
    }
  }

  async function handleLogin({ email, password }) {
    if (!String(email || "").trim() || !password) {
      setAuthError("请输入邮箱和密码");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const user = await signInCloud(email, password);
      await activateCloudUser(user);
      setShowLogin(false);
      if (location.pathname !== "/extension/auth") {
        navigate(location.pathname === "/account/settings" ? "/account/settings" : location.pathname.startsWith("/studio") ? "/studio" : "/my-prompts");
      }
      showToast("账号与提示词已同步");
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister({ email, password }) {
    if (!String(email || "").trim()) {
      setAuthError("请输入邮箱");
      return;
    }
    if (String(password || "").length < 6) {
      setAuthError("密码至少需要 6 位");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await signUpCloud(email, password);
      if (!result.hasSession) {
        setAuthError("注册成功，请打开邮箱完成验证后再登录");
        return;
      }
      await activateCloudUser(result.user, [], []);
      setShowLogin(false);
      if (location.pathname !== "/extension/auth") {
        navigate(location.pathname === "/account/settings" ? "/account/settings" : location.pathname.startsWith("/studio") ? "/studio" : "/my-prompts");
      }
      showToast("账号创建成功");
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOutCloud();
    } catch {
      // Logout remains available if the cloud connection is temporarily unavailable.
    }
    clearCurrentUser();
    setCurrentUser(null);
    setVerifiedUser(null);
    setLegacyPrompts([]);
    setProjects([]);
    setSyncState("idle");
    setShowLogin(false);
    navigate("/");
    showToast("已退出登录");
  }

  async function runCloudMutation(operation) {
    const writes = cloudWritesRef.current;
    if (!writes.pending) writes.failed = false;
    writes.pending++;
    setSyncState("loading");
    try {
      await operation();
      return true;
    } catch (error) {
      writes.failed = true;
      showToast(authErrorMessage(error));
      return false;
    } finally {
      writes.pending--;
      if (!writes.pending) setSyncState(writes.failed ? "error" : "ok");
    }
  }

  function persistCloudPrompt(prompt) {
    if (!currentUser) return;
    return runCloudMutation(() => upsertCloudPrompt(currentUser.id, prompt));
  }

  function saveOwnedPrompts(nextPrompts) {
    libraryRevisionRef.current++;
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
  }

  function saveOwnedProjects(nextProjects) {
    libraryRevisionRef.current++;
    const otherUsersProjects = loadProjects().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    saveProjects([...otherUsersProjects, ...nextProjects]);
  }

  function persistCloudProject(project) {
    if (!currentUser) return;
    return runCloudMutation(() => upsertCloudProject(currentUser.id, project));
  }

  function handleCreateProject(project) {
    if (!currentUser) {
      setShowLogin(true);
      return null;
    }

    const now = new Date().toISOString();
    const nextProject = {
      ...project,
      userId: currentUser.id,
      createdAt: project.createdAt ?? now,
      updatedAt: now,
    };
    const nextProjects = projects.some((entry) => entry.id === nextProject.id)
      ? projects.map((entry) => (entry.id === nextProject.id ? nextProject : entry))
      : [nextProject, ...projects];

    setProjects(nextProjects);
    saveOwnedProjects(nextProjects);
    persistCloudProject(nextProject);
    showToast("项目已创建");
    return nextProject;
  }

  function handleSaveStudioLibrary(data) {
    if (!currentUser) return;
    const now = Date.now();
    const nextProjects = data.projects.map((p) => {
      const previous = projects.find((entry) => entry.id === p.id);
      if (previous && previous.name === p.name && previous.color === p.dot && JSON.stringify(previous.items || []) === JSON.stringify(p.items)) return previous;
      return { ...previous, id: p.id, name: p.name, color: p.dot, items: p.items,
        userId: currentUser.id, createdAt: previous?.createdAt ?? now, updatedAt: now };
    });
    const nextPrompts = data.prompts.map((p) => {
      const previous = legacyPrompts.find((entry) => entry.id === p.id);
      const projectIds = data.projects.filter((project) => project.items.includes(p.id)).map((project) => project.id);
      const tags = [...new Set([...(previous?.taskTags || []), ...(previous?.effectTags || []), ...(previous?.tags || [])])];
      if (previous && previous.title === p.title && previous.content === p.body &&
          (previous.type === p.cat || (previous.type === 'workflow' && p.cat === 'text')) &&
          (previous.model ?? (previous.platforms || []).join(' / ')) === p.model &&
          (previous.tips || '') === p.tips && !!previous.favorite === !!p.fav &&
          JSON.stringify(tags) === JSON.stringify(p.tags) &&
          JSON.stringify(previous.projectIds || []) === JSON.stringify(projectIds)) return previous;
      return { ...previous, id: p.id, title: p.title, content: p.body, type: p.cat,
        model: p.model, tips: p.tips, tags: p.tags,
        taskTags: JSON.stringify(tags) === JSON.stringify(p.tags) ? (previous?.taskTags || []) : p.tags,
        effectTags: JSON.stringify(tags) === JSON.stringify(p.tags) ? (previous?.effectTags || []) : [],
        platforms: previous?.platforms || [p.model || '通用版'], favorite: !!p.fav,
        projectIds, userId: currentUser.id, usedCount: previous?.usedCount || 0,
        createdAt: previous?.createdAt ?? now, updatedAt: now };
    });
    const changedPrompts = nextPrompts.filter(p => !legacyPrompts.includes(p));
    const changedProjects = nextProjects.filter(p => !projects.includes(p));
    const removedPrompts = legacyPrompts.filter(p => !nextPrompts.some(n => n.id === p.id));
    const removedProjects = projects.filter(p => !nextProjects.some(n => n.id === p.id));
    if (!changedPrompts.length && !changedProjects.length && !removedPrompts.length && !removedProjects.length) return;
    setLegacyPrompts(nextPrompts);
    setProjects(nextProjects);
    saveOwnedPrompts(nextPrompts);
    saveOwnedProjects(nextProjects);
    runCloudMutation(() => Promise.all([
      upsertCloudPrompts(currentUser.id, changedPrompts),
      upsertCloudProjects(currentUser.id, changedProjects),
      ...removedPrompts.map(p => deleteCloudPrompt(currentUser.id, p.id)),
      ...removedProjects.map(p => deleteCloudProject(currentUser.id, p.id)),
    ]));
  }

  function handleCopyLegacyPrompt(prompt, content = prompt?.content, successMessage = "已复制收藏提示词") {
    if (!prompt || !content) return;
    copyText(content, successMessage);
    const nextPrompts = legacyPrompts.map((entry) =>
      entry.id === prompt.id
        ? { ...entry, usedCount: (entry.usedCount || 0) + 1, lastUsedAt: new Date().toISOString() }
        : entry
    );
    setLegacyPrompts(nextPrompts);
    saveOwnedPrompts(nextPrompts);
    const updated = nextPrompts.find((entry) => entry.id === prompt.id);
    if (updated) persistCloudPrompt(updated);
  }

  function handleNewUserPrompt() {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    setEditingPrompt(null);
    setShowPromptEditor(true);
  }

  function handleSaveUserPrompt(prompt) {
    if (!currentUser) return;
    const now = Date.now();
    const nextPrompt = {
      ...prompt,
      userId: currentUser.id,
      createdAt: prompt.createdAt ?? now,
      updatedAt: now,
    };
    const nextPrompts = legacyPrompts.some((entry) => entry.id === nextPrompt.id)
      ? legacyPrompts.map((entry) => (entry.id === nextPrompt.id ? nextPrompt : entry))
      : [nextPrompt, ...legacyPrompts];
    setLegacyPrompts(nextPrompts);
    saveOwnedPrompts(nextPrompts);
    setShowPromptEditor(false);
    setEditingPrompt(null);
    persistCloudPrompt(nextPrompt);
    showToast(editingPrompt ? "提示词已更新" : "提示词已创建");
  }

  async function handleDeleteUserPrompt(promptId) {
    const nextPrompts = legacyPrompts.filter((prompt) => prompt.id !== promptId);
    setLegacyPrompts(nextPrompts);
    saveOwnedPrompts(nextPrompts);
    setShowPromptEditor(false);
    setEditingPrompt(null);
    if (currentUser) {
      const saved = await runCloudMutation(() => deleteCloudPrompt(currentUser.id, promptId));
      if (!saved) return;
    }
    showToast("提示词已删除");
  }

  function handleToggleUserPromptFavorite(promptId) {
    const nextPrompts = legacyPrompts.map((prompt) =>
      prompt.id === promptId ? { ...prompt, favorite: !prompt.favorite, updatedAt: Date.now() } : prompt
    );
    setLegacyPrompts(nextPrompts);
    saveOwnedPrompts(nextPrompts);
    const updated = nextPrompts.find((prompt) => prompt.id === promptId);
    if (updated) persistCloudPrompt(updated);
  }

  function handleToggleContentFavorite(itemId) {
    const next = toggleContentFavorite(itemId);
    setFavoriteIds(next);
    showToast(next.includes(itemId) ? "已加入收藏" : "已取消收藏");
  }

  function openPromptStudio() {
    navigate("/studio");
    if (!currentUser) setShowLogin(true);
  }

  // Reuse the existing login form in place: the authorization URL and its entire
  // query remain untouched across login/registration, including a page reload.
  if (location.pathname === "/extension/auth") {
    return <ExtensionAuthPage authReady={authReady} currentUser={verifiedUser}
      authError={authError} authLoading={authLoading} existingUser={existingUser}
      onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (showLogin) {
    return (
      <>
        <LoginPage
          authError={authError}
          authLoading={authLoading}
          existingUser={existingUser}
          onClose={() => {
            setShowLogin(false);
            if (location.pathname === "/my-prompts" || location.pathname.startsWith("/studio")) navigate("/");
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  const isStudio = location.pathname.startsWith("/studio");
  const isExactHome = location.pathname === "/";

  return (
    <div className={isStudio ? "studio-route" : "v7-site"}>
      {!isStudio && !isExactHome ? (
        <V7Header
          currentUser={currentUser}
          onLoginRequest={() => setShowLogin(true)}
          onLogout={handleLogout}
          onStudioRequest={() => navigate("/studio")}
        />
      ) : null}

      <main className={isStudio ? "studio-route__main" : isExactHome ? "exact-home-main" : "v7-main"}>
        <Routes>
          <Route
            path="/"
            element={
              <ContentHomePage
                favoriteIds={favoriteIds}
                history={history}
                onLoginRequest={openPromptStudio}
                onToggleFavorite={handleToggleContentFavorite}
              />
            }
          />
          <Route path="/learn" element={<ContentListPage favoriteIds={favoriteIds} mode="learningPath" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/learn/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="learningPath" />} />
          <Route path="/knowledge" element={<ContentListPage favoriteIds={favoriteIds} mode="knowledge" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/knowledge/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="knowledge" />} />
          <Route path="/workflows" element={<ContentListPage favoriteIds={favoriteIds} mode="workflow" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/workflows/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="workflow" />} />
          <Route path="/tools" element={<ContentListPage favoriteIds={favoriteIds} mode="tool" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/tools/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="tool" />} />
          <Route path="/frontier" element={<ContentListPage favoriteIds={favoriteIds} mode="frontier" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/frontier/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="frontier" />} />
          <Route path="/templates" element={<ContentListPage favoriteIds={favoriteIds} mode="template" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/templates/:slug" element={<ContentDetailPage favoriteIds={favoriteIds} onToast={showToast} onToggleFavorite={handleToggleContentFavorite} type="template" />} />
          <Route path="/favorites" element={<ContentListPage favoriteIds={favoriteIds} mode="favorite" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route path="/search" element={<ContentListPage favoriteIds={favoriteIds} mode="search" onToggleFavorite={handleToggleContentFavorite} />} />
          <Route
            path="/content-studio"
            element={
              isContentPreviewEnabled()
                ? <ContentStudioPage onCopy={copyText} />
                : <NotFoundPage />
            }
          />
          <Route
            path="/my-prompts"
            element={
              currentUser ? (
                <V7UserPromptLibrary
                  prompts={visibleLegacyPrompts}
                  searchQuery={userPromptSearch}
                  syncState={syncState}
                  onCopy={handleCopyLegacyPrompt}
                  onEdit={(prompt) => {
                    setEditingPrompt(prompt);
                    setShowPromptEditor(true);
                  }}
                  onNew={handleNewUserPrompt}
                  onSearch={setUserPromptSearch}
                  onToggleFavorite={handleToggleUserPromptFavorite}
                />
              ) : (
                <section className="modular-auth-loading">
                  <p>{authReady ? "请登录后查看自己的提示词。" : "正在恢复账号..."}</p>
                  {authReady ? <button onClick={() => setShowLogin(true)} type="button">登录账号</button> : null}
                </section>
              )
            }
          />
          <Route
            path="/account/settings"
            element={<AccountSettingsPage currentUser={verifiedUser} authReady={authReady} onLoginRequest={() => setShowLogin(true)} />}
          />
          <Route
            path="/studio"
            element={
              currentUser ? (
                <OctoberStudioPage
                  currentUser={currentUser}
                  onSaveLibrary={handleSaveStudioLibrary}
                  onBack={() => navigate("/")}
                  onCopyPrompt={handleCopyLegacyPrompt}
                  onCreateProject={handleCreateProject}
                  onCopyText={copyText}
                  onEditPrompt={(prompt) => {
                    setEditingPrompt(prompt);
                    setShowPromptEditor(true);
                  }}
                  onLogout={handleLogout}
                  onAccountSettings={() => navigate("/account/settings")}
                  onNewPrompt={handleNewUserPrompt}
                  onToast={showToast}
                  onTogglePromptFavorite={handleToggleUserPromptFavorite}
                  projects={projects}
                  prompts={visibleLegacyPrompts}
                  syncState={syncState}
                />
              ) : (
                <section className="modular-auth-loading">
                  <p>{authReady ? "请登录后进入提示词工作台。" : "正在恢复账号..."}</p>
                  {authReady ? <button onClick={() => setShowLogin(true)} type="button">登录账号</button> : null}
                </section>
              )
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {showPromptEditor ? (
        <PromptEditorModal
          prompt={editingPrompt}
          projects={projects}
          onClose={() => {
            setShowPromptEditor(false);
            setEditingPrompt(null);
          }}
          onDelete={handleDeleteUserPrompt}
          onSave={handleSaveUserPrompt}
        />
      ) : null}
      <Toast message={toastMessage} />
    </div>
  );
}
