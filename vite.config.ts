import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    ),
  },
  server: {
    allowedHosts: ["bore.pub"],
  },
});
