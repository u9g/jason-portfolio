<script setup lang="ts">
import { ref, onMounted } from "vue";
import ShareButton from "./ShareButton.vue";
import { prUrl } from "../data/oss-repos";
import { repoGHInfo, fetchRepoInfo, sortedRepos } from "../data/oss-github-info";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

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
          <span v-if="repoGHInfo[repo.name]?.description" class="repo-about">
            <em>{{ repoGHInfo[repo.name].description }}</em>
          </span>
          <span class="lang-label" :style="{ color: repo.color }">{{ repo.lang }}</span>
          <span v-if="repoGHInfo[repo.name]?.stars" class="star-count">
            &#9733; {{ formatStars(repoGHInfo[repo.name].stars) }}
          </span>
        </div>
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
  margin-left: auto;
}

.star-count {
  font-size: 0.7rem;
  color: var(--text-bright);
}

.repo-about {
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--text-mid);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 0 1 50%;
  text-align: center;
  margin: 0 auto;
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
