import { useEffect, useLayoutEffect, useRef } from "react";

// The reference stays isolated so the existing site's styles cannot alter it.
export default function OctoberStudioPage(props) {
  const latest = useRef(props);
  const iframe = useRef(null);
  latest.current = props;

  useEffect(() => {
    iframe.current?.contentWindow?.pinpromptRefresh?.(props.prompts, props.projects);
  }, [props.prompts, props.projects]);

  useLayoutEffect(() => {
    const getHost = () => ({
      user: latest.current.currentUser,
      prompts: latest.current.prompts,
      projects: latest.current.projects,
      save: (data) => latest.current.onSaveLibrary(data),
      copy: (id, text) => latest.current.onCopyPrompt(
        latest.current.prompts.find((p) => p.id === id), text
      ),
      logout: () => latest.current.onLogout(),
      home: () => latest.current.onBack(),
      settings: () => latest.current.onAccountSettings(),
    });
    window.getPinpromptStudioHost = getHost;
    return () => {
      if (window.getPinpromptStudioHost === getHost) delete window.getPinpromptStudioHost;
    };
  }, []);

  return <iframe ref={iframe} className="october-studio-frame" src="/october/studio.html"
    title="拼好词 · 提示词档案工作台" />;
}
