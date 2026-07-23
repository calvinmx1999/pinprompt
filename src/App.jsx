import { useEffect, useMemo, useState } from "react";
import LoginPage from "./components/LoginPage.jsx";
import Toast from "./components/Toast.jsx";
import PromptSearchBar from "./components/PromptSearchBar.jsx";
import LearningSidebar from "./components/LearningSidebar.jsx";
import LearningFilterBar from "./components/LearningFilterBar.jsx";
import LearningGrid from "./components/LearningGrid.jsx";
import LearningDashboard from "./components/LearningDashboard.jsx";
import LearningHomePage from "./components/LearningHomePage.jsx";
import LearningDetailPage from "./components/LearningDetailPage.jsx";
import TemplateInspector from "./components/TemplateInspector.jsx";
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

const VIEW_META = {
  home: {
    title: "首页",
    sub: "从课程路径、案例拆解到模板练习，把 AIGC 真正学会，而不是只收藏一堆提示词。",
  },
  learningPaths: {
    title: "学习路径",
    sub: "按顺序推进，知道先学什么、再练什么，适合从零开始系统入门。",
  },
  pathDetail: {
    title: "学习路径详情",
    sub: "先看完整路径，再按步骤练习和复盘。",
  },
  cases: {
    title: "实战案例",
    sub: "从真实业务任务出发，拆解步骤、练习任务、常见错误和修改方法。",
  },
  caseDetail: {
    title: "实战案例详情",
    sub: "跟着一个案例走完整遍，会比只看知识点更快上手。",
  },
  articles: {
    title: "工具专栏",
    sub: "先理解工具适合什么、不适合什么，再决定什么时候该用它。",
  },
  articleDetail: {
    title: "工具专栏详情",
    sub: "把工具理解清楚，学习路径才会更顺。",
  },
  templates: {
    title: "提示词模板",
    sub: "看完路径和案例以后，直接复制模板开始动手练。",
  },
  favorites: {
    title: "我的收藏",
    sub: "把常看、常练、常复制的内容收在一起，后面复习更快。",
  },
};

function getDetailView(type) {
  if (type === "learningPath") return "pathDetail";
  if (type === "case") return "caseDetail";
  if (type === "article") return "articleDetail";
  return "templates";
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
    if (currentView === "templates") return "template";
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

  useEffect(() => {
    if (currentView !== "templates") return;
    const visibleTemplates = filteredItems.filter((item) => item.type === "template");
    if (!visibleTemplates.length) return;
    if (!selectedItemId || !visibleTemplates.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(visibleTemplates[0].id);
    }
  }, [currentView, filteredItems, selectedItemId]);

  function showToast(message) {
    setToastMessage(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToastMessage(""), 1800);
  }

  async function copyText(text, successMessage = "已复制提示词") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      showToast("复制失败，请手动复制");
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
    if (item.type === "template") {
      setSelectedItemId(item.id);
      setCurrentView("templates");
      return;
    }
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

  const meta = VIEW_META[currentView];
  const showFilters = ["learningPaths", "cases", "articles", "templates", "favorites"].includes(currentView);
  const showSearch = currentView !== "home";

  return (
    <div className="app-shell">
      <LearningSidebar
        counts={counts}
        currentUser={currentUser}
        currentView={currentView}
        onLoginRequest={() => setShowLogin(true)}
        onLogout={handleLogout}
        onViewChange={(view) => {
          resetFilters();
          handleViewChange(view);
        }}
      />

      <main className="workspace">
        <section className="workspace-main">
          <div className="workspace-main__header">
            <div>
              <div className="workspace-main__title">{meta.title}</div>
              <div className="workspace-main__sub">{meta.sub}</div>
            </div>
          </div>

          {showSearch ? (
            <PromptSearchBar
              hint="支持按学习方向、业务场景、工具和关键词搜索"
              onChange={setSearchQuery}
              placeholder="搜索学习主题，例如：AI 海报、可灵转场、人像修图、小红书文案"
              value={searchQuery}
            />
          ) : null}

          {showFilters ? (
            <LearningFilterBar
              directions={taxonomy.directions}
              onDirectionChange={setSelectedDirection}
              onScenarioChange={setSelectedScenario}
              onToolChange={setSelectedTool}
              scenarios={taxonomy.scenarios}
              selectedDirection={selectedDirection}
              selectedScenario={selectedScenario}
              selectedTool={selectedTool}
              tools={taxonomy.tools}
            />
          ) : null}

          {currentView === "home" && currentUser ? (
            <LearningDashboard
              items={items}
              onCopyLegacyPrompt={handleCopyLegacyPrompt}
              onOpenItem={handleOpenItem}
              prompts={visibleLegacyPrompts}
              tools={toolProfiles}
            />
          ) : currentView === "home" ? (
            <LearningHomePage items={items} onOpenItem={handleOpenItem} />
          ) : currentView === "pathDetail" || currentView === "caseDetail" || currentView === "articleDetail" ? (
            <LearningDetailPage
              item={selectedItem}
              onBack={handleBackFromDetail}
              onCopyPrompt={handleCopyPrompt}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <LearningGrid
              emptyBody={
                currentView === "favorites"
                  ? "先收藏几条学习路径、案例或模板，后面复习会更快。"
                  : "可以换个方向、业务场景或工具再试试。"
              }
              emptyTitle={currentView === "favorites" ? "还没有收藏内容" : "没有找到匹配内容"}
              items={filteredItems}
              onCopyPrompt={handleCopyPrompt}
              onSelect={handleSelectCard}
              onToggleFavorite={handleToggleFavorite}
              selectedItemId={selectedItemId}
            />
          )}
        </section>

        {currentView === "templates" || (currentView === "favorites" && selectedItem?.type === "template") ? (
          <TemplateInspector
            item={selectedItem?.type === "template" ? selectedItem : filteredItems.find((item) => item.type === "template") || null}
            onCopyPrompt={handleCopyPrompt}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : currentView === "home" ? (
          <aside className="inspector">
            <div className="inspector__section">
              <div className="section-title">{currentUser ? "学习站结构" : "开始学习"}</div>
              <div className="detail-list detail-list--tight">
                <div className="detail-list__item">
                  <strong>{currentUser ? "首页" : "公开内容"}</strong>
                  <p>{currentUser ? "继续学习、推荐课程、工具对比和旧提示词收藏集中展示。" : "无需登录也可以浏览学习路径、案例、工具文章和提示词模板。"}</p>
                </div>
                <div className="detail-list__item">
                  <strong>学习路径</strong>
                  <p>按方向推进，先建立文案、海报、视频和内容生产的基本方法。</p>
                </div>
                <div className="detail-list__item">
                  <strong>{currentUser ? "提示词模板" : "登录后"}</strong>
                  <p>{currentUser ? "保留原有收藏能力，模板仍然可以一键复制。" : "可以保留收藏、旧提示词和本地学习记录。"}</p>
                </div>
              </div>
              {!currentUser ? (
                <button className="primary-button primary-button--wide" onClick={() => setShowLogin(true)} type="button">
                  登录保存学习记录
                </button>
              ) : null}
            </div>
          </aside>
        ) : null}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
