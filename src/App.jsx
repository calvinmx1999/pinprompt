import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import PromptEditorModal from "./components/PromptEditorModal.jsx";
import Toast from "./components/Toast.jsx";
import V7Header from "./components/V7Header.jsx";
import V7UserPromptLibrary from "./components/V7UserPromptLibrary.jsx";
import ContentDetailPage from "./components/content/ContentDetailPage.jsx";
import ContentHomePage from "./components/content/ContentHomePage.jsx";
import ContentListPage from "./components/content/ContentListPage.jsx";
import NotFoundPage from "./components/content/NotFoundPage.jsx";
import {
  clearCurrentUser,
  ensureThemeSeed,
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
  fetchCloudLibrary,
  getCloudUser,
  signInCloud,
  signOutCloud,
  signUpCloud,
  upsertCloudProjects,
  upsertCloudPrompt,
  upsertCloudPrompts,
} from "./lib/cloud.js";
import {
  getContentFavoriteIds,
  getReadingHistory,
  toggleContentFavorite,
} from "./lib/contentStore.js";

const LIST_TITLES = {
  "/": "PinPrompt 拼好词｜AIGC学习平台",
  "/learn": "学习路径｜PinPrompt 拼好词",
  "/knowledge": "知识点｜PinPrompt 拼好词",
  "/workflows": "工作流｜PinPrompt 拼好词",
  "/tools": "工具库｜PinPrompt 拼好词",
  "/frontier": "AI前沿｜PinPrompt 拼好词",
  "/templates": "提示词模板｜PinPrompt 拼好词",
  "/favorites": "我的收藏｜PinPrompt 拼好词",
  "/my-prompts": "我的提示词｜PinPrompt 拼好词",
  "/search": "搜索｜PinPrompt 拼好词",
};

function setListSeo(pathname) {
  const title = LIST_TITLES[pathname];
  if (!title) return;
  document.title = title;
  const description = "PinPrompt 提供AIGC知识、工作流、工具指南、AI前沿和提示词模板。";
  let meta = document.head.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [existingUser, setExistingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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

  useEffect(() => {
    ensureThemeSeed();
    const migrationState = migrateLegacyData();
    const restoredUser = loadCurrentUser() || migrationState.currentUser || null;
    setExistingUser(restoredUser);
    setFavoriteIds(getContentFavoriteIds());
    setHistory(getReadingHistory());

    const localPrompts = loadPrompts();
    const localProjects = loadProjects();
    getCloudUser()
      .then(async (cloudUser) => {
        if (cloudUser) await activateCloudUser(cloudUser, localPrompts, localProjects);
        else clearCurrentUser();
      })
      .catch(() => clearCurrentUser())
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    setListSeo(location.pathname);
    setHistory(getReadingHistory());
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (authReady && location.pathname === "/my-prompts" && !currentUser) {
      setShowLogin(true);
    }
  }, [authReady, currentUser, location.pathname]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

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
    if (/failed to fetch|network|cloud_unavailable/i.test(message)) return "云端连接失败，请检查网络后重试";
    return message || "登录失败，请稍后重试";
  }

  async function activateCloudUser(user, localPrompts = loadPrompts(), localProjects = loadProjects()) {
    setSyncState("loading");
    const savedUser = saveCurrentUser(user);
    setExistingUser(savedUser);
    setCurrentUser(savedUser);

    try {
      const cloudLibrary = await fetchCloudLibrary(user.id);
      const ownedLocalPrompts = localPrompts.filter((prompt) => prompt.userId === user.id);
      const ownedLocalProjects = localProjects.filter((project) => project.userId === user.id);
      let nextPrompts = cloudLibrary.prompts;
      let nextProjects = cloudLibrary.projects;

      if (!nextPrompts.length && ownedLocalPrompts.length) {
        await upsertCloudPrompts(user.id, ownedLocalPrompts);
        nextPrompts = ownedLocalPrompts;
      }
      if (!nextProjects.length && ownedLocalProjects.length) {
        await upsertCloudProjects(user.id, ownedLocalProjects);
        nextProjects = ownedLocalProjects;
      }

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
      navigate("/my-prompts");
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
      navigate("/my-prompts");
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
    setLegacyPrompts([]);
    setProjects([]);
    setSyncState("idle");
    setShowLogin(false);
    navigate("/");
    showToast("已退出登录");
  }

  async function persistCloudPrompt(prompt) {
    if (!currentUser) return;
    setSyncState("loading");
    try {
      await upsertCloudPrompt(currentUser.id, prompt);
      setSyncState("ok");
    } catch (error) {
      setSyncState("error");
      showToast(authErrorMessage(error));
    }
  }

  function saveOwnedPrompts(nextPrompts) {
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
  }

  function handleCopyLegacyPrompt(prompt) {
    if (!prompt?.content) return;
    copyText(prompt.content, "已复制收藏提示词");
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
      createdAt: prompt.createdAt || now,
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
      setSyncState("loading");
      try {
        await deleteCloudPrompt(currentUser.id, promptId);
        setSyncState("ok");
      } catch (error) {
        setSyncState("error");
        showToast(authErrorMessage(error));
        return;
      }
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

  function openPersonalPrompts() {
    if (currentUser) navigate("/my-prompts");
    else setShowLogin(true);
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
            if (location.pathname === "/my-prompts") navigate("/");
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="v7-site">
      <V7Header
        currentUser={currentUser}
        onLoginRequest={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <main className="v7-main">
        <Routes>
          <Route
            path="/"
            element={
              <ContentHomePage
                favoriteIds={favoriteIds}
                history={history}
                onLoginRequest={openPersonalPrompts}
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
