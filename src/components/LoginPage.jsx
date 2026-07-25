import { useState } from "react";

export default function LoginPage({ authError, authLoading, existingUser, onLogin, onRegister }) {
  const [email, setEmail] = useState(existingUser?.email || "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand-block brand-block--login">
          <div className="brand-stack">
            <span className="brand-card brand-card--back-pink" />
            <span className="brand-card brand-card--back-yellow" />
            <span className="brand-card brand-card--front">拼</span>
          </div>
          <div className="brand-copy">
          <div className="brand-copy__title">
            <span>Pin</span>
            <span>Prompt</span>
          </div>
          <div className="brand-copy__sub">AIGC 实战学习站</div>
        </div>
      </div>

      <div className="login-card__head">
        <h1>{mode === "login" ? "登录 PinPrompt" : "创建 PinPrompt 账号"}</h1>
        <p>登录后将读取原账号里的提示词、项目和收藏，并继续自动保存到云端。</p>
      </div>

        <div className="login-mode-tabs">
          <button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")} type="button">登录</button>
          <button className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")} type="button">注册</button>
        </div>

        <div className="login-form">
          <label>
            <span>邮箱</span>
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>密码</span>
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "login" ? "输入原账号密码" : "至少 6 位密码"}
              type="password"
              value={password}
            />
          </label>
          {authError ? <div className="login-error">{authError}</div> : null}
          <button
            className="primary-button"
            disabled={authLoading}
            onClick={() =>
              mode === "login"
                ? onLogin({ email, password })
                : onRegister({ email, password })
            }
            type="button"
          >
            {authLoading ? "正在连接..." : mode === "login" ? "登录" : "创建账号"}
          </button>
        </div>
      </div>
    </div>
  );
}
