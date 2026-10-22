import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import { extensionRedirect } from "../lib/extension-auth.js";
import { extensionAccountRequest } from "../lib/extension-client.js";
import "../extension.css";

export default function ExtensionAuthPage({ authReady, currentUser, ...loginProps }) {
  const location = useLocation();
  const redirect = extensionRedirect(location.search);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function allow() {
    if (!redirect || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await extensionAccountRequest("token", { method: "POST" });
      if (typeof result?.token !== "string" || !result.token) throw new Error("授权结果无效，请重试");
      window.location.href = `${redirect}#token=${encodeURIComponent(result.token)}`;
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
      submitting.current = false;
    }
  }

  if (redirect && authReady && !currentUser) {
    return <LoginPage {...loginProps} onClose={() => { window.location.href = `${redirect}#error=access_denied`; }} />;
  }
  return (
    <section className="extension-shell">
      <div className="extension-card">
        <a className="extension-brand" href="/">拼好词 <span>PinPrompt</span></a>
        <span className="extension-tab">CHROME EXTENSION / 连接授权</span>
        {!redirect ? <>
          <h1>无法连接这个扩展</h1>
          <p role="alert">回调地址无效。请从拼好词 Chrome 扩展重新发起登录。</p>
        </> : !authReady ? <p role="status">正在确认账号，请稍候…</p> : <>
          <h1>拼好词扩展想访问你的提示词库</h1>
          <div className="extension-identity">
            {currentUser.avatar ? <img src={currentUser.avatar} alt="当前账号头像" referrerPolicy="no-referrer" />
              : <span className="extension-avatar" aria-hidden="true">{currentUser.name.slice(0, 1)}</span>}
            <div><strong>{currentUser.name}</strong><span>{currentUser.email}</span></div>
          </div>
          <p>授权后，扩展和网站上的提示词、项目会互相同步。</p>
          <small>你可以随时在账号设置中撤销连接。</small>
          {error ? <p className="extension-error" role="alert">{error}</p> : null}
          <div className="extension-actions">
            <button className="extension-primary" disabled={busy} onClick={allow} type="button">
              {busy ? "正在授权…" : error ? "重试" : "允许"}
            </button>
            <button disabled={busy} onClick={() => { window.location.href = `${redirect}#error=access_denied`; }} type="button">取消</button>
          </div>
        </>}
      </div>
    </section>
  );
}
