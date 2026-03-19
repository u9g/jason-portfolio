<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ShareButton from "./ShareButton.vue";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

interface RepoInfo {
  name: string;
  lang: string;
  color: string;
  prs: { id: string; description: string }[];
}

const repos: RepoInfo[] = [
  {
    name: "oxc-project/oxc",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "oxc#445", description: "Explain use of base 54/64 in mangler" },
      { id: "oxc#446", description: "Fix confusing and/or incorrect condition in linter" },
      { id: "oxc#447", description: "Reimplement more of the closure var rename step" },
      { id: "oxc#467", description: "Add IR view to playground" },
      { id: "oxc#524", description: "Visit jsx_element in AST visitor and add to ASTKind" },
      { id: "oxc#625", description: "Add oxc_query crate" },
      { id: "oxc#698", description: "Add query playground to website" },
      { id: "oxc#798", description: "Add linter plugin crate" },
      { id: "oxc#813", description: "Add linter plugin to VS Code extension" },
    ],
  },
  {
    name: "obi1kenobi/trustfall",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "trustfall#280", description: "Fix url property on all webpage objects" },
      { id: "trustfall#300", description: "Refactor materializeWebsite in browser_based_querying" },
      { id: "trustfall#339", description: "Add optimization to VertexType entrypoint in schema adapter" },
      { id: "trustfall#373", description: "Add InvalidSchemaError::DuplicateFieldDefinition" },
      { id: "trustfall#423", description: "Add min_fold_count_limit optimization" },
      { id: "trustfall#432", description: "Throw error for tag directive on edge" },
      { id: "trustfall#435", description: "Move to own Type type for everything exposed in trustfall_core" },
      { id: "trustfall#445", description: "Fix false assumption of vertex_type being singleton" },
      { id: "trustfall#463", description: 'Add error for filter where value argument is just ["$"] or ["%"]' },
    ],
  },
  {
    name: "obi1kenobi/cargo-semver-checks",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "cargo-semver-checks#500", description: "Add trait removed associated type lint" },
      { id: "cargo-semver-checks#501", description: "Make CI hash Rust files not toml files" },
      { id: "cargo-semver-checks#587", description: "Implement struct_now_doc_hidden lint" },
      { id: "cargo-semver-checks#593", description: "Implement enum_now_doc_hidden lint" },
      { id: "cargo-semver-checks#594", description: "Implement function_now_doc_hidden lint" },
      { id: "cargo-semver-checks#595", description: "Implement trait_now_doc_hidden lint" },
    ],
  },
  {
    name: "obi1kenobi/trustfall-rustdoc-adapter",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "trustfall-rustdoc-adapter#211", description: "Add AssociatedType to schema" },
    ],
  },
  {
    name: "async-graphql/async-graphql",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "async-graphql#1336", description: 'Parse "repeatable" in directive definitions' },
    ],
  },
  {
    name: "oven-sh/bun",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "bun#1714", description: "Fix Bun.serve typings" },
      { id: "bun#1923", description: "fix(bench): Fix if condition always being true" },
      { id: "bun#2227", description: "Remake typings for FFI dlopen/linkSymbols + introduce Pointer type" },
    ],
  },
  {
    name: "SerenityOS/serenity",
    lang: "C++",
    color: "#f34b7d",
    prs: [
      { id: "serenity#12502", description: "Base: Add Spreadsheet alias to shellrc" },
      { id: "serenity#12508", description: "Spreadsheet: Make ranges vertically end-inclusive" },
      { id: "serenity#12539", description: "Spreadsheets: Add range functions to Position class" },
      { id: "serenity#12767", description: "Spreadsheet: Add Range.first(), minIf/maxIf/sumProductIf functions" },
      { id: "serenity#12799", description: "Spreadsheet: Make Range.forEach() return Position objects, add Range.at()" },
      { id: "serenity#12853", description: "Spreadsheet: Make Range support all examples, add toArray()" },
      { id: "serenity#12869", description: "Spreadsheet: Add CommonRange class + integer() improvements" },
      { id: "serenity#12882", description: "Spreadsheet: Add SplitRange class and CommonRange#filter" },
      { id: "discord-bot#374", description: "GithubCommand: Add url option" },
      { id: "discord-bot#381", description: "User: Add User command" },
    ],
  },
  {
    name: "SerenityOS/jakt",
    lang: "C++",
    color: "#f34b7d",
    prs: [
      { id: "jakt#376", description: "codegen+lexer+typechecker+parser: Add NoneCoalescingAssign" },
      { id: "jakt#473", description: "Add generic parsing to selfhost" },
      { id: "jakt#487", description: "vscode: Separate function and field autocompletions" },
      { id: "jakt#627", description: "samples: Greatly improve json sample and read_all sample app" },
    ],
  },
  {
    name: "PaperMC/Paper",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Paper#7278", description: "Add new overload to PersistentDataContainer#has" },
      { id: "Paper#7787", description: "Add PlayerReleaseItemEvent" },
      { id: "Paper#7880", description: "Add ARMOR tag to MaterialTags (1.18.2)" },
      { id: "Paper#7987", description: "Add ARMOR tag to MaterialTags (1.19)" },
      { id: "Paper#7988", description: "Add Player#getFishHook" },
    ],
  },
  {
    name: "Col-E/Recaf",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Recaf#458", description: "Move to GitHub Actions" },
      { id: "Recaf#470", description: "Fixes mappings throwing error" },
      { id: "Recaf#471", description: "Fix test results not being shown on PRs from forks" },
    ],
  },
  {
    name: "boxbeam/RedLib",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "RedLib#30", description: "Add SQLHelper#executeUpdate" },
      { id: "RedLib#32", description: "Add SQLHelper.Results#getBytes and querySingleResultBytes" },
      { id: "RedLib#36", description: "Allow forcing Double on a list" },
    ],
  },
  {
    name: "NotEnoughUpdates/NotEnoughUpdates",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "NEU#374", description: "[Calculator] Add exponent operator and % postfix" },
    ],
  },
  {
    name: "Legacy-Fabric/yarn",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "yarn#190", description: "Minecraft 1.8.9 mappings" },
      { id: "yarn#191", description: "Mappings Part 2" },
      { id: "yarn#198", description: "First mapping done with the new tool" },
      { id: "yarn#213", description: "A few fixes for 1.8.9" },
    ],
  },
  {
    name: "discordjs/discord.js",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "discord.js#5566", description: "feat(Util): allow array for StringOptions' char" },
    ],
  },
  {
    name: "nodejs/node",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "node#51454", description: "doc: fix spelling mistake" },
    ],
  },
  {
    name: "TanStack/query",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "query#9269", description: "docs: Fix syntax of batshit in batching-requests article" },
    ],
  },
  {
    name: "scratchfoundation/scratch-vm",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "scratch-vm#2833", description: "Added colon" },
    ],
  },
  {
    name: "andywer/typed-emitter",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "typed-emitter#16", description: 'Fix: stop exporting TS file as "main" in package.json' },
    ],
  },
  {
    name: "TkTech/Burger",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "Burger#24", description: "Update entity tracker for newer MC versions" },
    ],
  },
  {
    name: "linusg/serenity_exporter",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "serenity_exporter#2", description: "Fix kmalloc_available writing to wrong metric" },
    ],
  },
  {
    name: "HangarMC/Hangar",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Hangar#676", description: "Link to new forums instead of old" },
    ],
  },
  {
    name: "lmorg/murex",
    lang: "Go",
    color: "#00add8",
    prs: [
      { id: "murex#802", description: "Fix mistake in rosetta stone" },
    ],
  },
];

// GitHub API cache (descriptions + stars)
const CACHE_KEY = "oss-repo-info";
const CACHE_TS_KEY = "oss-repo-info-ts";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week

interface RepoGHInfo {
  description: string;
  stars: number;
}

const repoGHInfo = ref<Record<string, RepoGHInfo>>({});

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

async function fetchRepoInfo() {
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
    })
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

const sortedRepos = computed(() => {
  return [...repos].sort((a, b) => {
    const starsA = repoGHInfo.value[a.name]?.stars ?? 0;
    const starsB = repoGHInfo.value[b.name]?.stars ?? 0;
    return starsB - starsA;
  });
});

function prUrl(repoName: string, prId: string): string {
  const num = prId.split("#")[1];
  return `https://github.com/${repoName}/pull/${num}`;
}

const expandedRepos = ref<Set<string>>(new Set());

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

onMounted(fetchRepoInfo);
</script>

<template>
  <div class="conversation">
    <div class="top-bar">
      <button
        v-if="sidebarCollapsed"
        class="sidebar-toggle"
        @click="emit('toggleSidebar')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"
          ></path>
        </svg>
      </button>
      Notable OSS Contributions
      <ShareButton />
    </div>
    <div class="oss-content">
      <div v-for="repo in sortedRepos" :key="repo.name" class="repo-section">
        <div class="repo-header">
          <span class="lang-dot" :style="{ background: repo.color }"></span>
          <a
            :href="`https://github.com/${repo.name}`"
            target="_blank"
            rel="noopener noreferrer"
            class="repo-link"
          >
            <span class="repo-org-group"><span class="repo-org">{{ repo.name.split('/')[0] }}</span><span class="repo-sep">/</span></span><span class="repo-name">{{ repo.name.split('/')[1] }} <span class="arrow">↗</span></span>
          </a>
          <span class="lang-label" :style="{ color: repo.color }">{{ repo.lang }}</span>
          <span v-if="repoGHInfo[repo.name]?.stars" class="star-count">
            &#9733; {{ formatStars(repoGHInfo[repo.name].stars) }}
          </span>
        </div>
        <p v-if="repoGHInfo[repo.name]?.description" class="repo-about">
          <em>{{ repoGHInfo[repo.name].description }}</em>
        </p>
        <table class="pr-table">
          <tbody>
            <tr
              v-for="pr in expandedRepos.has(repo.name) ? repo.prs : repo.prs.slice(0, 3)"
              :key="pr.id"
            >
              <td class="pr-desc">
                <a
                  :href="prUrl(repo.name, pr.id)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pr-link"
                >{{ pr.description }} <span class="arrow">↗</span></a>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          v-if="repo.prs.length > 3 && !expandedRepos.has(repo.name)"
          class="show-more-btn"
          @click="expandedRepos.add(repo.name)"
        >
          Show {{ repo.prs.length - 3 }} more
        </button>
        <button
          v-else-if="repo.prs.length > 3"
          class="show-more-btn"
          @click="expandedRepos.delete(repo.name)"
        >
          Show less
        </button>
      </div>

    </div>
  </div>
</template>

<style lang="css" scoped>
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 56px;
  position: sticky;
  top: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-base);
  z-index: 1;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0;
  color: var(--text-muted);
}

.sidebar-toggle:hover {
  background: var(--bg-hover);
}

@media (min-width: 1025px) {
  .sidebar-toggle {
    display: none;
  }
}


.oss-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem 2rem;
  min-width: 0;
  overflow-x: hidden;
}

.repo-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.repo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lang-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.repo-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-bright);
  text-decoration: none;
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.repo-org-group {
  display: flex;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
}

.repo-org {
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
}

.repo-sep {
  color: var(--text-dim);
  flex-shrink: 0;
}

.repo-name {
  white-space: nowrap;
  flex-shrink: 0;
}

.repo-link:hover {
  text-decoration: underline;
}

.lang-label {
  font-size: 0.7rem;
}

.star-count {
  font-size: 0.7rem;
  color: var(--text-bright);
  margin-left: auto;
}

.repo-about {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--text-mid);
  padding-left: 18px;
}

.repo-about em {
  font-family: "Playfair Display", serif;
  font-style: italic;
  color: var(--text-bright);
}

.pr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  font-weight: 300;
  table-layout: fixed;
}

.pr-table td {
  padding: 5px 8px;
  color: var(--text-muted);
}

.pr-table tr:hover td {
  background: var(--bg-hover-light);
}

.show-more-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  padding: 4px 8px;
  text-align: left;
}

.show-more-btn:hover {
  color: var(--text-bright);
}

.pr-link {
  color: var(--text-muted);
  text-decoration: none;
}

.pr-link .arrow,
.repo-link .arrow {
  opacity: 0;
}

.pr-link:hover .arrow,
.repo-link:hover .arrow {
  opacity: 1;
}

.pr-link:hover {
  color: var(--text-bright);
}

.pr-desc {
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
