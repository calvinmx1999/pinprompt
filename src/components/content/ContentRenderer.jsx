import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PromptBlock({ children, onToast }) {
  const content = String(children || "").replace(/\n$/, "");
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  function showCopied() {
    setCopied(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyPrompt() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(content);
      showCopied();
      onToast?.("已复制提示词");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      const copiedWithFallback = document.execCommand("copy");
      textarea.remove();

      if (copiedWithFallback) {
        showCopied();
        onToast?.("已复制提示词");
      } else {
        onToast?.("复制失败，请手动复制");
      }
    }
  }

  return (
    <section className="content-prompt-block">
      <header>
        <strong>Prompt</strong>
        <button className={copied ? "is-copied" : ""} onClick={copyPrompt} type="button">
          {copied ? "✓ 已复制" : "复制提示词"}
        </button>
      </header>
      <pre>{content}</pre>
    </section>
  );
}

function MarkdownImage({ alt, src }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="content-image-fallback">图片暂时无法显示：{alt || "未命名图片"}</span>;
  }
  return <img alt={alt || ""} loading="lazy" onError={() => setFailed(true)} src={src} />;
}

export default function ContentRenderer({ markdown, onToast }) {
  if (!markdown) {
    return <div className="content-renderer__empty">正文正在整理中。</div>;
  }

  return (
    <div className="content-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ children, href }) {
            const external = /^https?:\/\//.test(href || "");
            return (
              <a
                href={href}
                rel={external ? "noreferrer noopener" : undefined}
                target={external ? "_blank" : undefined}
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return <aside className="content-callout">{children}</aside>;
          },
          code({ children, className }) {
            if (className === "language-prompt") {
              return <PromptBlock onToast={onToast}>{children}</PromptBlock>;
            }
            if (className) {
              return <code className={className}>{children}</code>;
            }
            return <code>{children}</code>;
          },
          img({ alt, src }) {
            return <MarkdownImage alt={alt} src={src} />;
          },
          pre({ children }) {
            if (
              children?.type === PromptBlock ||
              children?.props?.className === "language-prompt"
            ) {
              return children;
            }
            return <pre className="content-code-block">{children}</pre>;
          },
          table({ children }) {
            return (
              <div className="content-table-wrap">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
