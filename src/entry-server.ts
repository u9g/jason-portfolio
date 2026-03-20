import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import App from "./App.vue";

export async function render(url: string) {
  const app = createSSRApp(App);
  app.provide("initialPath", url);
  return await renderToString(app);
}
