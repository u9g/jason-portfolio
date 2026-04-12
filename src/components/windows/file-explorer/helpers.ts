export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    ts: "TypeScript File", js: "JavaScript File", vue: "Vue File",
    json: "JSON File", css: "CSS File", html: "HTML File",
    md: "Markdown File", svg: "SVG File", mjs: "JavaScript File",
    png: "PNG Image", jpg: "JPEG Image", jpeg: "JPEG Image",
    txt: "Text File", yml: "YAML File", yaml: "YAML File",
  };
  return types[ext ?? ""] ?? "File";
}

export function rawUrl(path: string, currentRepo: string): string {
  const repo = currentRepo.includes("/") ? currentRepo : `u9g/${currentRepo}`;
  return `https://raw.githubusercontent.com/${repo}/HEAD/${path}`;
}
