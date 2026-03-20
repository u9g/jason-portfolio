import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

const template = readFileSync(resolve(distDir, "index.html"), "utf-8");
const { render } = await import(resolve(distDir, "server/entry-server.js"));
const conversations = JSON.parse(
  readFileSync(resolve(__dirname, "../src/data/conversations.json"), "utf-8"),
);

const SITE = "https://jasonlernerman.com";
const SITE_NAME = "Jason";
const FULL_NAME = "Jason Lernerman";
const allConversations = [...conversations.jobs, ...conversations.projects];

function getMeta(url) {
  if (url === "/") {
    return {
      title: `${SITE_NAME}'s Portfolio`,
      description:
        "Software engineer portfolio — job experience, personal projects, and open source contributions.",
    };
  }

  const slug = url.replace("/claude/", "") || "about";
  const conv = allConversations.find((c) => c.slug === slug);

  if (slug === "about" || url === "/claude") {
    return {
      title: `About | ${SITE_NAME}`,
      description:
        "Jason Lernerman, a software engineer with experience in Javascript, TypeScript, Kotlin, Java, Rust, and more.",
    };
  }
  if (slug === "oss") {
    return {
      title: `OSS | ${SITE_NAME}`,
      description: `Notable open source contributions by ${FULL_NAME} across Rust, TypeScript, and C++ projects.`,
    };
  }
  if (conv) {
    const firstAnswer = conv.conversation.find((m) => m.role === "assistant");
    return {
      title: `${conv.title.split(",")[0]} | ${SITE_NAME}`,
      description: firstAnswer
        ? firstAnswer.message.slice(0, 160)
        : `${conv.title} — ${SITE_NAME}'s portfolio.`,
    };
  }

  return {
    title: `${SITE_NAME}'s Portfolio`,
    description: "Jason Lernerman's software engineering portfolio.",
  };
}

// Convert favicon SVG to PNG for OG image
const svgPath = resolve(__dirname, "../public/favicon.svg");
await sharp(svgPath).resize(512, 512).png().toFile(resolve(distDir, "og-image.png"));
console.log("Generated og-image.png from favicon.svg");

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
  const appHtml = await render(url);
  const { title, description } = getMeta(url);
  const canonicalUrl = url === "/claude/about" ? `${SITE}/claude` : `${SITE}${url}`;

  const headTags = [
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${FULL_NAME}'s Portfolio">`,
    `<meta property="og:image" content="${SITE}/og-image.png">`,
  ].join("\n    ");

  const page = template
    .replace("<title>Jason's Portfolio</title>", `<title>${title}</title>\n    ${headTags}`)
    .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

  const outDir = url === "/" ? distDir : resolve(distDir, url.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), page);

  console.log(`Pre-rendered: ${url} → ${title}`);
}
