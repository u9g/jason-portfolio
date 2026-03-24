export function renderMarkdown(text: string): string {
  let result = text.replace(
    /\[([^\]]*(?:\[[^\]]*\])[^\]]*|[^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>',
  );
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return result;
}
