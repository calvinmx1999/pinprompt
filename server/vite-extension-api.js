import { createExtensionHandler } from "./extension-api.js";

// Run the same Function handler under `npm run dev`; production uses api/extension/.
export function extensionApiPlugin() {
  return {
    name: "pinprompt-extension-api",
    configureServer(server) {
      const handler = createExtensionHandler();
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith("/api/extension/")) return next();
        response.status = code => { response.statusCode = code; return response; };
        response.json = data => { response.setHeader("Content-Type", "application/json; charset=utf-8"); response.end(JSON.stringify(data)); };
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 4_000_000) {
            response.status(413).json({ error: "提示词库超过单次同步大小限制" });
            return;
          }
          chunks.push(chunk);
        }
        if (chunks.length) request.body = Buffer.concat(chunks);
        await handler(request, response);
      });
    },
  };
}
