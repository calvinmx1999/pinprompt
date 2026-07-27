import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api/supabase": {
        target: "https://zayfzpsrhxiaetrcttko.supabase.co",
        changeOrigin: true,
        rewrite: (path) => {
          const incoming = new URL(path, "http://localhost");
          return incoming.searchParams.get("path") || "/";
        },
      },
    },
  },
});
