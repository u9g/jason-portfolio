export interface GHEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  pushedAt?: string;
}

const USER = "u9g";
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

export async function fetchContents(path: string, repo = "jason-portfolio"): Promise<GHEntry[]> {
  const key = `${repo}:${path || "__root__"}`;
  if (key in cache) return cache[key];

  const fullRepo = repo.includes("/") ? repo : `${USER}/${repo}`;
  const url = path
    ? `https://api.github.com/repos/${fullRepo}/contents/${path}`
    : `https://api.github.com/repos/${fullRepo}/contents`;

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

export async function fetchUserRepos(): Promise<GHEntry[]> {
  const key = "__repos__";
  if (key in cache) {
    cache[key].sort((a, b) => {
      if (a.name === "jason-portfolio") return -1;
      if (b.name === "jason-portfolio") return 1;
      return (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "");
    });
    return cache[key];
  }

  const entries: GHEntry[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=updated`,
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json() as { name: string; size: number; pushed_at: string }[];
    if (data.length === 0) break;
    for (const repo of data) {
      entries.push({
        name: repo.name,
        path: `__repo__:${repo.name}`,
        type: "dir",
        size: repo.size,
        pushedAt: repo.pushed_at,
      });
    }
    if (data.length < 100) break;
    page++;
  }

  entries.sort((a, b) => {
    // jason-portfolio always first
    if (a.name === "jason-portfolio") return -1;
    if (b.name === "jason-portfolio") return 1;
    // Sort by pushed_at descending (most recent first)
    return (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "");
  });
  cache[key] = entries;
  saveCache(cache);
  return entries;
}

export interface PinnedRepo {
  name: string;
  owner: string;
}

export const PINNED_REPOS: PinnedRepo[] = [
  { name: "Utils", owner: "u9g" },
  { name: "promptlog", owner: "u9g" },
  { name: "mineflayer", owner: "PrismarineJS" },
  { name: "oxc", owner: "nicolo-ribaudo" },
  { name: "uno-royale", owner: "u9g" },
  { name: "jason-portfolio", owner: "u9g" },
];

export async function fetchTree(repo = "jason-portfolio"): Promise<GHEntry[]> {
  const key = `__tree__:${repo}`;
  if (key in cache) return cache[key];

  const fullRepo = repo.includes("/") ? repo : `${USER}/${repo}`;
  const res = await fetch(`https://api.github.com/repos/${fullRepo}/git/trees/HEAD?recursive=1`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json() as { tree: { path: string; type: string; size?: number }[] };
  const entries: GHEntry[] = data.tree
    .filter((item) => item.type === "blob" || item.type === "tree")
    .map((item) => ({
      name: item.path.split("/").pop() ?? item.path,
      path: item.path,
      type: item.type === "tree" ? "dir" as const : "file" as const,
      size: item.size ?? 0,
    }));

  cache[key] = entries;
  saveCache(cache);
  return entries;
}

export async function fetchFileContent(path: string, repo = "jason-portfolio"): Promise<string> {
  const fullRepo = repo.includes("/") ? repo : `${USER}/${repo}`;
  const res = await fetch(
    `https://api.github.com/repos/${fullRepo}/contents/${path}`,
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  const binary = atob((data as { content: string }).content.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
