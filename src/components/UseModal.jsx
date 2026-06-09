import { useEffect, useMemo, useRef, useState } from "react";
import { PLATFORM_URLS, TYPE_LABELS } from "../data/prompts.js";

const PLATFORM_OPTIONS = [
  { id: "nano-banana", name: "Nano Banana", url: PLATFORM_URLS["Nano Banana"], types: ["img"] },
  { id: "seedance", name: "Seedance", url: PLATFORM_URLS.Seedance, types: ["vid"] },
  { id: "kling", name: "可灵 Kling", url: PLATFORM_URLS.Kling, types: ["vid", "img"] },
  { id: "jimeng", name: "即梦 Jimeng", url: PLATFORM_URLS["即梦"], types: ["vid", "img"] },
  { id: "lovart", name: "Lovart", url: PLATFORM_URLS.Lovart, types: ["img"] },
  { id: "gpt-image-2", name: "GPT-Image-2", url: PLATFORM_URLS["gpt-image-2"], types: ["img"] },
  { id: "claude", name: "Claude", url: PLATFORM_URLS.Claude, types: ["txt"] },
  { id: "copy", name: "仅复制", url: null, types: ["img", "vid", "txt"] },
];

export default function UseModal({ prompt, onClose, onCopy }) {
  const [vars, setVars] = useState(() => {
    const init = {};
    (prompt.variables || []).forEach((v) => { init[v.key] = ""; });
    return init;
  });
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef(null);

  const availablePlatforms = useMemo(
    () => PLATFORM_OPTIONS.filter((platform) => platform.types.includes(prompt.type)),
    [prompt.type]
  );

  useEffect(() => {
    const matchedPlatform = availablePlatforms.find(
      (platform) =>
        platform.name.toLowerCase() === String(prompt.platform || "").toLowerCase()
    );

    if (matchedPlatform) {
      setSelectedPlatform(matchedPlatform.id);
      return;
    }

    if (availablePlatforms.length > 0) {
      setSelectedPlatform(availablePlatforms[0].id);
    }
  }, [availablePlatforms, prompt.platform]);

  // esc 关闭
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // 将变量替换进 content
  function buildFinalPrompt() {
    let text = prompt.content;
    Object.entries(vars).forEach(([key, val]) => {
      if (val.trim()) text = text.replaceAll(`{${key}}`, val.trim());
    });
    return text;
  }

  async function handleConfirm() {
    const finalText = buildFinalPrompt();
    await navigator.clipboard.writeText(finalText).catch(() => {});
    setCopied(true);
    onCopy && onCopy(finalText, prompt.title);

    const platform = availablePlatforms.find((p) => p.id === selectedPlatform);
    if (platform?.url) {
      setTimeout(() => { window.open(platform.url, "_blank"); }, 300);
    }
    setTimeout(onClose, 1800);
  }

  const hasVars = prompt.variables && prompt.variables.length > 0;
  const allVarsFilled = !hasVars || prompt.variables.every((v) => vars[v.key]?.trim());

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        width: "100%", maxWidth: "480px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        overflow: "hidden",
        animation: "slideUp 0.18s ease",
      }}>
        {/* 头部 */}
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: "0.5px solid #f0ede8",
          display: "flex", alignItems: "flex-start", gap: "12px",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "9px",
            background: prompt.previewBg || "#e8e4dc",
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 500, padding: "1px 7px",
                borderRadius: "99px",
                background: prompt.type === "vid" ? "#FBEAF0" : prompt.type === "txt" ? "#E6F1FB" : "#E1F5EE",
                color: prompt.type === "vid" ? "#993556" : prompt.type === "txt" ? "#185FA5" : "#0F6E56",
              }}>{TYPE_LABELS[prompt.type]}</span>
              {prompt.platform && (
                <span style={{
                  fontSize: "10px", padding: "1px 7px", borderRadius: "99px",
                  background: "#f5f0e8", color: "#7a6040",
                  border: "0.5px solid #e0d8cc",
                }}>{prompt.platform}</span>
              )}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", lineHeight: 1.3 }}>
              {prompt.title}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "#aaa", fontSize: "18px", padding: "2px", lineHeight: 1,
            flexShrink: 0,
          }}>×</button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 变量填写区 */}
          {hasVars && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "#555", marginBottom: "10px" }}>
                填写变量
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {prompt.variables.map((v) => (
                  <div key={v.key}>
                    <label style={{
                      fontSize: "11px", color: "#888", display: "block", marginBottom: "4px",
                    }}>
                      <code style={{
                        background: "#f5f0e8", color: "#7a6040",
                        padding: "1px 5px", borderRadius: "4px", fontSize: "10px",
                      }}>{`{${v.key}}`}</code>
                      {" "}{v.label}
                    </label>
                    <input
                      type="text"
                      value={vars[v.key]}
                      onChange={(e) => setVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                      placeholder={v.placeholder}
                      style={{
                        width: "100%",
                        border: "0.5px solid #e0ddd8",
                        borderRadius: "7px",
                        padding: "7px 10px",
                        fontSize: "13px",
                        color: "#1a1a1a",
                        outline: "none",
                        background: "#fafaf8",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#999")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0ddd8")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt 预览 */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#555", marginBottom: "8px" }}>
              Prompt 预览
            </div>
            <div style={{
              background: "#fafaf8",
              border: "0.5px solid #e8e5e0",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "11px",
              color: "#666",
              lineHeight: 1.6,
              maxHeight: "90px",
              overflowY: "auto",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {buildFinalPrompt()}
            </div>
          </div>

          {/* 平台选择 */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#555", marginBottom: "10px" }}>
              复制后跳转到
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {availablePlatforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: selectedPlatform === p.id ? "1.5px solid #1a1a1a" : "0.5px solid #e0ddd8",
                    background: selectedPlatform === p.id ? "#1a1a1a" : "#fff",
                    color: selectedPlatform === p.id ? "#fff" : "#555",
                    fontSize: "12px",
                    fontWeight: selectedPlatform === p.id ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "0.5px solid #f0ede8",
          display: "flex", gap: "8px",
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px 0",
            border: "0.5px solid #e0ddd8", borderRadius: "8px",
            background: "#fff", color: "#555",
            fontSize: "13px", cursor: "pointer",
          }}>
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allVarsFilled || copied}
            style={{
              flex: 2, padding: "9px 0",
              border: "none", borderRadius: "8px",
              background: copied ? "#639922" : (!allVarsFilled ? "#ccc" : "#1a1a1a"),
              color: "#fff",
              fontSize: "13px", fontWeight: 500,
              cursor: !allVarsFilled || copied ? "default" : "pointer",
              transition: "background 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            {copied ? (
              <><span>✓</span> 已复制，正在跳转…</>
            ) : (
              <>
                <span style={{ fontSize: "14px" }}>⌘</span>
                {selectedPlatform === "copy" ? "复制 Prompt" : "复制并前往平台"}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
