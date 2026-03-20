import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync, mkdirSync } from "fs";
import { resolve } from "path";

function claudeRoutePlugin(): Plugin {
  return {
    name: "claude-route",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/claude" || req.url?.startsWith("/claude?") || req.url?.startsWith("/claude#")) {
          req.url = "/index.html";
        }
        next();
      });
    },
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const claudeDir = resolve(distDir, "claude");
      mkdirSync(claudeDir, { recursive: true });
      copyFileSync(resolve(distDir, "index.html"), resolve(claudeDir, "index.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), claudeRoutePlugin()],
  define: {
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    ),
  },
  server: {
    allowedHosts: ["bore.pub"],
  },
});
