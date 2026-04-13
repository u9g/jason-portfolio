import { techColors } from "./tech-colors";
import arrowSvgRaw from "../assets/arrow.svg?raw";
import fileExplorerSvgRaw from "../assets/file-explorer.svg?raw";

const langPattern = new RegExp(
  `\\b(${Object.keys(techColors)
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "g",
);

// .trim() strips the file's trailing newline so it doesn't render as a
// stray whitespace character after the SVG inside the wrapper span.
const ARROW_HTML = `<span class="arrow">${arrowSvgRaw.trim()}</span>`;
const EXPLORER_ICON = `<span class="explorer-btn-icon">${fileExplorerSvgRaw.trim()}</span>`;

const GITHUB_REPO_RE = /^https?:\/\/github\.com\/([^/]+\/[^/]+?)(?:\/)?(?:[?#].*)?$/;

export function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function renderMarkdown(text: string): string {
  // Inline code first, so later transforms don't touch its contents
  let result = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(
    /\[([^\]]*(?:\[[^\]]*\])[^\]]*|[^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_match, label: string, url: string) => {
      const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ${ARROW_HTML}</a>`;
      const repoMatch = url.match(GITHUB_REPO_RE);
      if (repoMatch) {
        const repo = repoMatch[1];
        return `${link} <button class="open-in-explorer-btn" data-repo="${repo}">${EXPLORER_ICON} Open in File Explorer</button>`;
      }
      return link;
    },
  );
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return result;
}

export function renderMessage(text: string): string {
  let result = renderMarkdown(text);
  result = result.replace(langPattern, (match) => {
    const color = techColors[match];
    return `<span style="color: ${color}">${match}</span>`;
  });
  return result;
}
