import { techColors } from "./tech-colors";
import arrowSvgRaw from "../assets/arrow.svg?raw";

const langPattern = new RegExp(
  `\\b(${Object.keys(techColors)
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "g",
);

// .trim() strips the file's trailing newline so it doesn't render as a
// stray whitespace character after the SVG inside the wrapper span.
const ARROW_HTML = `<span class="arrow">${arrowSvgRaw.trim()}</span>`;

export function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function renderMarkdown(text: string): string {
  // Inline code first, so later transforms don't touch its contents
  let result = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(
    /\[([^\]]*(?:\[[^\]]*\])[^\]]*|[^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer">$1 ${ARROW_HTML}</a>`,
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
