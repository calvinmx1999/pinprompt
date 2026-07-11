import { useState } from "react";

export default function LoginPage({ existingUser, onContinue, onLogin }) {
  const [email, setEmail] = useState(existingUser?.email || "");
  const [password, setPassword] = useState("");

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
        <h1>登录 PinPrompt</h1>
        <p>当前为本地版本，登录后将读取本地保存的学习记录和收藏内容。</p>
      </div>

        {existingUser ? (
          <button className="primary-button login-card__continue" onClick={onContinue} type="button">
            继续使用 {existingUser.name} 的账号
          </button>
        ) : null}

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
              placeholder="输入任意内容即可继续"
              type="password"
              value={password}
            />
          </label>
          <button
            className="primary-button"
            onClick={() => onLogin({ email, password })}
            type="button"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  );
}
