import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

const template = readFileSync(resolve(distDir, "index.html"), "utf-8");
const { render } = await import(resolve(distDir, "server/entry-server.js"));

const routes = [
  "/",
  "/claude",
  "/claude/about",
  "/claude/oss",
  "/claude/midnight-sky",
  "/claude/dataset-ai",
  "/claude/vue-technology",
  "/claude/cerium",
];

for (const url of routes) {
  const html = await render(url);
  const page = template.replace(
    '<div id="app"></div>',
    `<div id="app">${html}</div>`,
  );

  const outDir = url === "/" ? distDir : resolve(distDir, url.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), page);

  console.log(`Pre-rendered: ${url}`);
}
