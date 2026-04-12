export interface GHEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
}

const REPO = "u9g/jason-portfolio";
const CACHE_KEY = "gh-fs-cache";
const CACHE_TS_KEY = "gh-fs-cache-ts";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

function isCacheExpired(): boolean {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts) return true;
  return Date.now() - Number(ts) > CACHE_TTL;
}

function loadCache(): Record<string, GHEntry[]> {
  try {
    if (isCacheExpired()) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TS_KEY);
      return {};
    }
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveCache(cache: Record<string, GHEntry[]>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
}

const cache = loadCache();

export async function fetchContents(path: string): Promise<GHEntry[]> {
  const key = path || "__root__";
  if (key in cache) return cache[key];

  const url = path
    ? `https://api.github.com/repos/${REPO}/contents/${path}`
    : `https://api.github.com/repos/${REPO}/contents`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  const entries: GHEntry[] = (data as { name: string; path: string; type: string; size: number }[])
    .map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type === "dir" ? "dir" as const : "file" as const,
      size: item.size,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  cache[key] = entries;
  saveCache(cache);
  return entries;
}

export async function fetchFileContent(path: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  return atob((data as { content: string }).content.replace(/\n/g, ""));
}
