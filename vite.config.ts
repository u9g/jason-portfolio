import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const CLAUDE_SLUGS = ["about", "oss", "midnight-sky", "dataset-ai", "vue-technology", "cerium"];

function claudeRoutePlugin(): Plugin {
  return {
    name: "claude-route",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/claude")) {
          req.url = "/index.html";
        }
        next();
      });
    },
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const src = resolve(distDir, "index.html");

      // /claude → /dist/claude/index.html
      const claudeDir = resolve(distDir, "claude");
      mkdirSync(claudeDir, { recursive: true });
      copyFileSync(src, resolve(claudeDir, "index.html"));

      // /claude/:slug → /dist/claude/:slug/index.html
      for (const slug of CLAUDE_SLUGS) {
        const slugDir = resolve(claudeDir, slug);
        mkdirSync(slugDir, { recursive: true });
        copyFileSync(src, resolve(slugDir, "index.html"));
      }
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
