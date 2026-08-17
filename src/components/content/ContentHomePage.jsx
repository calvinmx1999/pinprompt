import { useNavigate } from "react-router-dom";

export default function ContentHomePage({ onLoginRequest }) {
  const navigate = useNavigate();

  function connectReferenceLinks(event) {
    const frameDocument = event.currentTarget.contentDocument;
    if (!frameDocument || frameDocument.documentElement.dataset.pinpromptConnected) return;

    frameDocument.documentElement.dataset.pinpromptConnected = "true";
    frameDocument.addEventListener("click", (clickEvent) => {
      const link = clickEvent.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const label = link.textContent.replace(/\s+/g, " ").trim();
      let destination = null;

      if (label.includes("提示词工作台") || label === "私人词库") {
        clickEvent.preventDefault();
        onLoginRequest();
        return;
      }
      if (href === "#/knowledge" || label.includes("开始探索")) destination = "/knowledge";
      else if (href === "#/market" || label.includes("提示词市集") || label.includes("提示词模板")) destination = "/templates";
      else if (label.includes("工作流")) destination = "/workflows";
      else if (label.includes("工具")) destination = "/tools";
      else if (label.includes("前沿")) destination = "/frontier";

      if (destination) {
        clickEvent.preventDefault();
        navigate(destination);
      }
    }, true);
  }

  return (
    <iframe
      className="exact-kimi-home"
      onLoad={connectReferenceLinks}
      src="/kimi-home/index.html"
      title="PinPrompt · 人人都能参与的 AIGC 学习平台"
    />
  );
}
