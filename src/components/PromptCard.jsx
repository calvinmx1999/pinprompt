import { useState } from "react";
import { TYPE_LABELS } from "../data/prompts.js";

const TYPE_STYLE = {
  img: { bg: "#E1F5EE", color: "#0F6E56" },
  vid: { bg: "#FBEAF0", color: "#993556" },
  txt: { bg: "#E6F1FB", color: "#185FA5" },
};

export default function PromptCard({ prompt, isStarred, onToggleStar, onCopy, onUse }) {
  const [hovered, setHovered] = useState(false);
  const typeStyle = TYPE_STYLE[prompt.type] || TYPE_STYLE.txt;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onUse(prompt)}
      style={{
        background: "#fff",
        borderRadius: "10px",
        border: hovered ? "0.5px solid #999" : "0.5px solid #e5e3de",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 预览区 */}
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        background: prompt.previewBg || "#e8e4dc",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {prompt.type === "txt" ? (
          <div style={{
            padding: "14px",
            fontSize: "9px",
            color: "#a09070",
            lineHeight: 1.7,
            fontFamily: "monospace",
            opacity: 0.75,
            overflow: "hidden",
          }}>
            {prompt.content.slice(0, 140)}
          </div>
        ) : (
          <div style={{ fontSize: "28px", opacity: 0.2 }}>
            {prompt.type === "vid" ? "▶" : "⬜"}
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      <div style={{ padding: "10px 12px 6px", flex: 1 }}>
        {/* 类型+平台+星标 */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "5px" }}>
          <span style={{
            fontSize: "10px", fontWeight: 500,
            padding: "1px 7px", borderRadius: "99px",
            background: typeStyle.bg, color: typeStyle.color,
          }}>
            {TYPE_LABELS[prompt.type]}
          </span>
          {prompt.platform && (
            <span style={{
              fontSize: "10px", padding: "1px 7px", borderRadius: "99px",
              background: "#f5f0e8", color: "#7a6040",
              border: "0.5px solid #e0d8cc",
            }}>
              {prompt.platform}
            </span>
          )}
          {/* 变量标记 */}
          {prompt.variables?.length > 0 && (
            <span style={{
              fontSize: "9px", padding: "1px 5px", borderRadius: "4px",
              background: "#f5f0e8", color: "#9a7040",
              marginLeft: "auto",
            }}>
              {prompt.variables.length} 个变量
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(prompt.id); }}
            aria-label={isStarred ? "取消收藏" : "收藏"}
            style={{
              marginLeft: prompt.variables?.length > 0 ? "0" : "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isStarred ? "#f0a500" : "#ddd",
              fontSize: "14px",
              padding: "0",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
          >
            ★
          </button>
        </div>

        <div style={{
          fontSize: "13px", fontWeight: 500, color: "#1a1a1a",
          marginBottom: "4px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {prompt.title}
        </div>

        <div style={{
          fontSize: "11px", color: "#888", lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "33px",
        }}>
          {prompt.preview}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "6px 12px 10px",
        display: "flex", alignItems: "center",
        borderTop: "0.5px solid #f5f3f0",
        marginTop: "6px",
      }}>
        <span style={{ fontSize: "10px", color: "#bbb", flex: 1 }}>
          {prompt.tags.map((t) => `#${t}`).join(" ")}
        </span>
        <span style={{
          fontSize: "10px", color: "#ccc",
          opacity: hovered ? 0 : 1,
          transition: "opacity 0.15s",
        }}>
          用了 {prompt.useCount} 次
        </span>
      </div>

      {/* Hover 操作按钮 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "28px 10px 10px",
        background: "linear-gradient(to top, rgba(255,255,255,1) 55%, rgba(255,255,255,0))",
        display: "flex", gap: "6px",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.15s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy(prompt.content, prompt.title); }}
          style={{
            flex: 1, padding: "6px 0",
            border: "0.5px solid #e0ddd8", borderRadius: "7px",
            background: "#fff", color: "#555",
            fontSize: "11px", fontWeight: 500,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}
        >
          <span style={{ fontSize: "12px" }}>⎘</span> 复制
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onUse(prompt); }}
          style={{
            flex: 1.5, padding: "6px 0",
            border: "none", borderRadius: "7px",
            background: "#1a1a1a", color: "#fff",
            fontSize: "11px", fontWeight: 500,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}
        >
          <span>▶</span> 立即使用
        </button>
      </div>
    </div>
  );
}
