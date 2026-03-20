import { ref, computed } from "vue";
import { repos } from "./oss-repos";
import type { RepoInfo } from "./oss-repos";

export interface RepoGHInfo {
  description: string;
  stars: number;
}

const CACHE_KEY = "oss-repo-info";
const CACHE_TS_KEY = "oss-repo-info-ts";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week

function isCacheExpired(): boolean {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts) return true;
  return Date.now() - Number(ts) > CACHE_TTL;
}

function loadCache(): Record<string, RepoGHInfo> {
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

function saveCache(cache: Record<string, RepoGHInfo>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
}

export const repoGHInfo = ref<Record<string, RepoGHInfo>>({});

export async function fetchRepoInfo() {
  const cache = loadCache();
  const repoNames = [...new Set(repos.map((r) => r.name))];
  const missing = repoNames.filter((name) => !(name in cache));

  if (missing.length === 0) {
    repoGHInfo.value = cache;
    return;
  }

  const results = await Promise.allSettled(
    missing.map(async (name) => {
      const res = await fetch(`https://api.github.com/repos/${name}`);
      if (!res.ok) return { name, description: "", stars: 0 };
      const data = await res.json();
      return {
        name,
        description: data.description || "",
        stars: data.stargazers_count || 0,
      };
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      cache[result.value.name] = {
        description: result.value.description,
        stars: result.value.stars,
      };
    }
  }

  saveCache(cache);
  repoGHInfo.value = cache;
}

export const sortedRepos = computed<RepoInfo[]>(() => {
  return [...repos].sort((a, b) => {
    const starsA = repoGHInfo.value[a.name]?.stars ?? 0;
    const starsB = repoGHInfo.value[b.name]?.stars ?? 0;
    return starsB - starsA;
  });
});
