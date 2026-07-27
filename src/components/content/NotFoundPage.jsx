import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "页面未找到｜PinPrompt 拼好词";
  }, []);

  return (
    <section className="modular-not-found">
      <strong>404</strong>
      <h1>这个页面不存在</h1>
      <p>地址可能已经修改，或者内容尚未发布。</p>
      <button onClick={() => navigate("/")} type="button">返回首页</button>
    </section>
  );
}
