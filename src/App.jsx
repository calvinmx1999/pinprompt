import { useEffect, useMemo, useState } from "react";
import LoginPage from "./components/LoginPage.jsx";
import Toast from "./components/Toast.jsx";
import LearningDetailPage from "./components/LearningDetailPage.jsx";
import PromptEditorModal from "./components/PromptEditorModal.jsx";
import V7ContentPage from "./components/V7ContentPage.jsx";
import V7Dashboard from "./components/V7Dashboard.jsx";
import V7Header from "./components/V7Header.jsx";
import V7HomePage from "./components/V7HomePage.jsx";
import V7UserPromptLibrary from "./components/V7UserPromptLibrary.jsx";
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
  filterLearningItems,
  getLearningTaxonomy,
  loadLearningItems,
  loadToolProfiles,
  toggleFavoriteId,
} from "./lib/learningSite.js";

function getDetailView(type) {
  if (type === "learningPath") return "pathDetail";
  if (type === "case") return "caseDetail";
  if (type === "article") return "articleDetail";
  return "templateDetail";
}

function getListView(type) {
  if (type === "learningPath") return "learningPaths";
  if (type === "case") return "cases";
  if (type === "article") return "articles";
  return "templates";
}

export default function App() {
  const [existingUser, setExistingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncState, setSyncState] = useState("idle");
  const [items, setItems] = useState([]);
  const [legacyPrompts, setLegacyPrompts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [toolProfiles, setToolProfiles] = useState([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [userPromptSearch, setUserPromptSearch] = useState("");
  const [currentView, setCurrentView] = useState("home");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirection, setSelectedDirection] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState("all");
  const [selectedTool, setSelectedTool] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    ensureThemeSeed();
    const migrationState = migrateLegacyData();
    const restoredUser = loadCurrentUser() || migrationState.currentUser || null;
    setExistingUser(restoredUser || migrationState.currentUser || null);
    setItems(loadLearningItems());
    const localPrompts = loadPrompts();
    const localProjects = loadProjects();
    setLegacyPrompts([]);
    setProjects([]);
    setToolProfiles(loadToolProfiles());

    getCloudUser()
      .then((cloudUser) => {
        if (cloudUser) return activateCloudUser(cloudUser, localPrompts, localProjects);
        clearCurrentUser();
        return null;
      })
      .catch(() => {
        clearCurrentUser();
      });
  }, []);

  const taxonomy = useMemo(() => getLearningTaxonomy(items), [items]);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );
  const visibleLegacyPrompts = useMemo(() => {
    if (!currentUser) return [];
    return legacyPrompts.filter((prompt) => prompt.userId === currentUser.id);
  }, [currentUser, legacyPrompts]);

  const activeType = useMemo(() => {
    if (currentView === "learningPaths" || currentView === "pathDetail") return "learningPath";
    if (currentView === "cases" || currentView === "caseDetail") return "case";
    if (currentView === "articles" || currentView === "articleDetail") return "article";
    if (currentView === "templates" || currentView === "templateDetail") return "template";
    return "all";
  }, [currentView]);

  const filteredItems = useMemo(
    () =>
      filterLearningItems(items, {
        type: activeType,
        query: searchQuery,
        direction: selectedDirection,
        scenario: selectedScenario,
        tool: selectedTool,
        favoriteOnly: currentView === "favorites",
      }),
    [activeType, currentView, items, searchQuery, selectedDirection, selectedScenario, selectedTool]
  );

  function showToast(message) {
    setToastMessage(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToastMessage(""), 1800);
  }

  async function copyText(text, successMessage = "已复制提示词") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API unavailable");
      }
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

  function refreshItems() {
    setItems(loadLearningItems());
  }

  function handleToggleFavorite(itemId) {
    toggleFavoriteId(itemId);
    refreshItems();
    showToast("已更新收藏");
  }

  function handleCopyPrompt(itemId) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item?.prompt) return;
    copyText(item.prompt, "已复制提示词");
  }

  function handleCopyLegacyPrompt(prompt) {
    if (!prompt?.content) return;
    copyText(prompt.content, "已复制收藏提示词");
    const nextPrompts = legacyPrompts.map((entry) =>
      entry.id === prompt.id
        ? {
            ...entry,
            usedCount: (entry.usedCount || 0) + 1,
            lastUsedAt: new Date().toISOString(),
          }
        : entry
    );
    setLegacyPrompts(nextPrompts);
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
    const updatedPrompt = nextPrompts.find((entry) => entry.id === prompt.id);
    if (currentUser && updatedPrompt) {
      persistCloudPrompt(updatedPrompt);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedDirection("all");
    setSelectedScenario("all");
    setSelectedTool("all");
  }

  function handleOpenItem(item) {
    setSelectedItemId(item.id);
    setCurrentView(getDetailView(item.type));
  }

  function handleSelectCard(itemId) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    handleOpenItem(item);
  }

  function handleBackFromDetail() {
    if (!selectedItem) {
      setCurrentView("home");
      return;
    }
    setCurrentView(getListView(selectedItem.type));
  }

  function handleViewChange(view) {
    if (view === "myPrompts" && !currentUser) {
      setShowLogin(true);
      return;
    }
    setCurrentView(view);
    if (view !== "templates" && !view.endsWith("Detail")) {
      setSelectedItemId(null);
    }
  }

  function authErrorMessage(error) {
    const message = String(error?.message || "");
    if (/invalid login credentials/i.test(message)) return "邮箱或密码不正确";
    if (/email not confirmed/i.test(message)) return "请先打开邮箱完成账号验证";
    if (/password/i.test(message) && /6/i.test(message)) return "密码至少需要 6 位";
    if (/already registered/i.test(message)) return "该邮箱已经注册，请直接登录";
    if (/failed to fetch|network/i.test(message)) return "云端连接失败，请检查网络后重试";
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
      const otherUsersPrompts = localPrompts.filter(
        (prompt) => prompt.userId && prompt.userId !== user.id
      );
      const otherUsersProjects = localProjects.filter(
        (project) => project.userId && project.userId !== user.id
      );
      savePrompts([...otherUsersPrompts, ...normalizedPrompts]);
      saveProjects([...otherUsersProjects, ...normalizedProjects]);
      setLegacyPrompts(loadPrompts().filter((prompt) => prompt.userId === user.id));
      setProjects(loadProjects().filter((project) => project.userId === user.id));
      setSyncState("ok");
    } catch (error) {
      const cachedPrompts = localPrompts.filter((prompt) => prompt.userId === user.id);
      const cachedProjects = localProjects.filter((project) => project.userId === user.id);
      setLegacyPrompts(cachedPrompts);
      setProjects(cachedProjects);
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
      setCurrentView("myPrompts");
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
      setCurrentView("myPrompts");
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
      // Local logout still proceeds when the network is temporarily unavailable.
    }
    clearCurrentUser();
    setCurrentUser(null);
    setLegacyPrompts([]);
    setProjects([]);
    setSyncState("idle");
    setShowLogin(false);
    setCurrentView("home");
    setSelectedItemId(null);
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

  function handleNewUserPrompt() {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    setEditingPrompt(null);
    setShowPromptEditor(true);
  }

  function handleEditUserPrompt(prompt) {
    setEditingPrompt(prompt);
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
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
    setShowPromptEditor(false);
    setEditingPrompt(null);
    persistCloudPrompt(nextPrompt);
    showToast(editingPrompt ? "提示词已更新" : "提示词已创建");
  }

  async function handleDeleteUserPrompt(promptId) {
    const nextPrompts = legacyPrompts.filter((prompt) => prompt.id !== promptId);
    setLegacyPrompts(nextPrompts);
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
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
    const otherUsersPrompts = loadPrompts().filter(
      (entry) => entry.userId && entry.userId !== currentUser?.id
    );
    savePrompts([...otherUsersPrompts, ...nextPrompts]);
    const updatedPrompt = nextPrompts.find((prompt) => prompt.id === promptId);
    if (updatedPrompt) persistCloudPrompt(updatedPrompt);
  }

  if (!currentUser && showLogin) {
    return (
      <>
        <LoginPage
          authError={authError}
          authLoading={authLoading}
          existingUser={existingUser}
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
        currentView={currentView}
        onLoginRequest={() => setShowLogin(true)}
        onLogout={handleLogout}
        onSearch={(query) => {
          setSearchQuery(query);
          if (query && currentView === "home") setCurrentView("cases");
        }}
        onViewChange={(view) => {
          resetFilters();
          handleViewChange(view);
        }}
        searchQuery={searchQuery}
      />

      <main className="v7-main">
          {currentView === "home" && currentUser ? (
            <V7Dashboard
              currentUser={currentUser}
              items={items}
              onCopyLegacyPrompt={handleCopyLegacyPrompt}
              onCreatePrompt={handleNewUserPrompt}
              onOpenItem={handleOpenItem}
              onOpenPromptLibrary={() => setCurrentView("myPrompts")}
              prompts={visibleLegacyPrompts}
              tools={toolProfiles}
            />
          ) : currentView === "home" ? (
            <V7HomePage
              items={items}
              onOpenItem={handleOpenItem}
              onStartLearning={() => setShowLogin(true)}
              onViewChange={handleViewChange}
            />
          ) : currentView === "myPrompts" ? (
            <V7UserPromptLibrary
              prompts={visibleLegacyPrompts}
              searchQuery={userPromptSearch}
              syncState={syncState}
              onCopy={handleCopyLegacyPrompt}
              onEdit={handleEditUserPrompt}
              onNew={handleNewUserPrompt}
              onSearch={setUserPromptSearch}
              onToggleFavorite={handleToggleUserPromptFavorite}
            />
          ) : ["pathDetail", "caseDetail", "articleDetail", "templateDetail"].includes(currentView) ? (
            <LearningDetailPage
              item={selectedItem}
              onBack={handleBackFromDetail}
              onCopyPrompt={handleCopyPrompt}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <V7ContentPage
              filters={{
                direction: selectedDirection,
                directions: taxonomy.directions,
                scenario: selectedScenario,
                scenarios: taxonomy.scenarios,
                tool: selectedTool,
                tools: taxonomy.tools,
              }}
              items={filteredItems}
              onCopyPrompt={handleCopyPrompt}
              onFilterChange={(name, value) => {
                if (name === "direction") setSelectedDirection(value);
                if (name === "scenario") setSelectedScenario(value);
                if (name === "tool") setSelectedTool(value);
              }}
              onOpenItem={(item) => handleSelectCard(item.id)}
              onToggleFavorite={handleToggleFavorite}
              tools={toolProfiles}
              type={
                currentView === "learningPaths"
                  ? "learningPath"
                  : currentView === "cases"
                    ? "case"
                    : currentView === "articles"
                      ? "article"
                      : currentView === "templates"
                        ? "template"
                        : "favorite"
              }
            />
          )}
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
