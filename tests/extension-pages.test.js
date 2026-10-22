import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { build } from "esbuild";

// Render the real JSX without a network listener or browser process. No test-only
// frontend dependencies; esbuild is already part of the Vite toolchain.
const { outputFiles } = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { Router } from 'react-router-dom';
      import ExtensionAuthPage from './src/components/ExtensionAuthPage.jsx';
      import AccountSettingsPage from './src/components/AccountSettingsPage.jsx';
      export function renderAuth(search, props) {
        return renderToStaticMarkup(<Router location={'/extension/auth' + search} navigator={{}}><ExtensionAuthPage {...props} /></Router>);
      }
      export function renderSettings(props) {
        return renderToStaticMarkup(<Router location='/account/settings' navigator={{createHref: value => value.pathname}}><AccountSettingsPage {...props} /></Router>);
      }
    `,
    resolveDir: process.cwd(), loader: "jsx",
  },
  write: false, bundle: true, platform: "node", format: "cjs", jsx: "automatic",
  define: { "import.meta.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "ignore-css-in-render-test", setup(builder) {
    builder.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const compiled = { exports: {} };
new Function("require", "module", "exports", outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const { renderAuth, renderSettings } = compiled.exports;
const query = "?redirect_uri=" + encodeURIComponent("https://jchjipehcgipjchkgcdaejhdebeniieg.chromiumapp.org/auth");
const user = { id: "owner", name: "创作者", email: "creator@example.test", avatar: "https://example.test/avatar.png" };

test("无效回调先显示错误，不展示账号、登录表单或授权按钮", () => {
  const html = renderAuth("?redirect_uri=https://evil.test", { authReady: true, currentUser: user });
  assert.match(html, /回调地址无效/);
  assert.doesNotMatch(html, /creator@example|允许|type="password"/);
});

test("会话恢复期间显示等待，未登录复用邮箱登录表单", () => {
  assert.match(renderAuth(query, { authReady: false, currentUser: null }), /正在确认账号/);
  const html = renderAuth(query, { authReady: true, currentUser: null });
  assert.match(html, /登录 PinPrompt/);
  assert.match(html, /type="email"/);
  assert.match(html, /type="password"/);
  assert.doesNotMatch(html, /拼好词扩展想访问你的提示词库/);
});

test("已验证账号展示授权文案、头像、昵称、邮箱和两个按钮", () => {
  const html = renderAuth(query, { authReady: true, currentUser: user });
  for (const value of ["拼好词扩展想访问你的提示词库", "创作者", "creator@example.test", "授权后，扩展和网站上的提示词、项目会互相同步。", "允许", "取消"]) {
    assert.ok(html.includes(value));
  }
  assert.match(html, /https:\/\/example.test\/avatar.png/);
});

test("账号设置需要登录，已登录显示连接列表的加载状态", () => {
  assert.match(renderSettings({ authReady: true, currentUser: null }), /登录后管理你的扩展连接/);
  const html = renderSettings({ authReady: true, currentUser: user });
  assert.match(html, /已连接的浏览器扩展/);
  assert.match(html, /正在读取连接/);
});
