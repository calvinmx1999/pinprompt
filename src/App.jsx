import { useEffect, useMemo, useState } from "react";
import LoginPage from "./components/LoginPage.jsx";
import Toast from "./components/Toast.jsx";
import LearningDetailPage from "./components/LearningDetailPage.jsx";
import V7ContentPage from "./components/V7ContentPage.jsx";
import V7Dashboard from "./components/V7Dashboard.jsx";
import V7Header from "./components/V7Header.jsx";
import V7HomePage from "./components/V7HomePage.jsx";
import {
  clearCurrentUser,
  createLocalUser,
  ensureThemeSeed,
  loadCurrentUser,
  loadPrompts,
  migrateLegacyData,
  saveCurrentUser,
  savePrompts,
} from "./lib/storage.js";
import {
  filterLearningItems,
  getLearningCounts,
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
  const [items, setItems] = useState([]);
  const [legacyPrompts, setLegacyPrompts] = useState([]);
  const [toolProfiles, setToolProfiles] = useState([]);
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
    setCurrentUser(restoredUser);
    setItems(loadLearningItems());
    setLegacyPrompts(loadPrompts());
    setToolProfiles(loadToolProfiles());
  }, []);

  const counts = useMemo(() => getLearningCounts(items), [items]);
  const taxonomy = useMemo(() => getLearningTaxonomy(items), [items]);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );
  const visibleLegacyPrompts = useMemo(() => {
    if (!currentUser) return legacyPrompts;
    return legacyPrompts.filter((prompt) => !prompt.userId || prompt.userId === currentUser.id);
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
    savePrompts(nextPrompts);
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
    setCurrentView(view);
    if (view !== "templates" && !view.endsWith("Detail")) {
      setSelectedItemId(null);
    }
  }

  function handleLogin({ email }) {
    const nextUser =
      existingUser && (!email || existingUser.email === email)
        ? existingUser
        : createLocalUser({ email, name: email ? email.split("@")[0] : "AIGC 学员" });
    const savedUser = saveCurrentUser(nextUser);
    setExistingUser(savedUser);
    setCurrentUser(savedUser);
    setShowLogin(false);
    showToast("欢迎进入 AIGC 学习站");
  }

  function handleLogout() {
    clearCurrentUser();
    setCurrentUser(null);
    setShowLogin(false);
    setCurrentView("home");
    setSelectedItemId(null);
    showToast("已退出登录");
  }

  if (!currentUser && showLogin) {
    return (
      <>
        <LoginPage
          existingUser={existingUser}
          onContinue={() => {
            if (!existingUser) return;
            setCurrentUser(saveCurrentUser(existingUser));
            setShowLogin(false);
            showToast("欢迎回来");
          }}
          onLogin={handleLogin}
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
              onOpenItem={handleOpenItem}
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

      <Toast message={toastMessage} />
    </div>
  );
}
