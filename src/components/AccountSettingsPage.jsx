import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { extensionAccountRequest } from "../lib/extension-client.js";
import "../extension.css";

const date = value => value ? new Date(value).toLocaleString("zh-CN") : "尚未使用";

export default function AccountSettingsPage({ currentUser, authReady, onLoginRequest }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState(null);
  const revision = useRef(0);
  const reload = useCallback(async () => {
    const request = ++revision.current;
    setLoading(true);
    setError("");
    try {
      const result = await extensionAccountRequest("tokens");
      if (!Array.isArray(result?.tokens)) throw new Error("连接列表暂时无法读取，请重试");
      if (request === revision.current) setTokens(result.tokens);
    } catch (failure) { if (request === revision.current) setError(failure.message); }
    finally { if (request === revision.current) setLoading(false); }
  }, []);
  useEffect(() => {
    if (authReady && currentUser) reload();
    return () => { revision.current++; };
  }, [authReady, currentUser?.id, reload]);

  async function revoke(id) {
    setRevoking(id);
    setError("");
    try {
      await extensionAccountRequest(`tokens/${id}`, { method: "DELETE" });
      setTokens(previous => previous.filter(token => token.id !== id));
    } catch (failure) { setError(failure.message); }
    finally { setRevoking(null); }
  }

  return <section className="extension-shell">
    <div className="extension-card extension-settings">
      <Link className="extension-brand" to="/studio">← 返回工作台</Link>
      <span className="extension-tab">ACCOUNT / 账号设置</span>
      <h1>已连接的浏览器扩展</h1>
      {!authReady ? <p role="status">正在确认账号…</p> : !currentUser ? <>
        <p>登录后管理你的扩展连接。</p><button onClick={onLoginRequest} type="button">登录账号</button>
      </> : <>
        <p>{currentUser.name} · {currentUser.email}</p>
        <small>撤销后，该连接将无法继续读取或同步你的提示词和项目。</small>
        {loading ? <p role="status">正在读取连接…</p> : tokens.length ? <ul className="extension-connections">
          {tokens.map(token => <li key={token.id}>
            <div><strong>拼好词 Chrome 扩展</strong>
              <span>创建时间：{date(token.created_at)}</span>
              <span>最近使用：{date(token.last_used_at)}</span></div>
            <button disabled={revoking !== null} onClick={() => revoke(token.id)} type="button">{revoking === token.id ? "正在撤销…" : "撤销"}</button>
          </li>)}
        </ul> : !error ? <p>还没有连接浏览器扩展。</p> : null}
        {error ? <div role="alert"><p className="extension-error">{error}</p><button disabled={loading} onClick={reload} type="button">重试</button></div> : null}
      </>}
    </div>
  </section>;
}
