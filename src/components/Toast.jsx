export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: "28px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1a1a1a",
      color: "#fff",
      fontSize: "13px",
      padding: "8px 18px",
      borderRadius: "99px",
      zIndex: 2000,
      pointerEvents: "none",
      whiteSpace: "nowrap",
      animation: "toastIn 0.2s ease",
    }}>
      {message}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
