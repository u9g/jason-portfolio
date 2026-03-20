import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

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
