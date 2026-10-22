import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { extensionApiPlugin } from "./server/vite-extension-api.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "SUPABASE_");
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value;
  return {
    base: "/",
    plugins: [react(), extensionApiPlugin()],
    server: {
      proxy: {
        "/api/supabase": {
          target: env.SUPABASE_URL || process.env.SUPABASE_URL || "https://zayfzpsrhxiaetrcttko.supabase.co",
          changeOrigin: true,
          rewrite: (path) => {
            const incoming = new URL(path, "http://localhost");
            return incoming.searchParams.get("path") || "/";
          },
        },
      },
    },
  };
});
