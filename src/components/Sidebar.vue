<script setup lang="ts">
import bookIcon from "../assets/book.svg";
import codeIcon from "../assets/code.svg";
import contactIcon from "../assets/contact.svg";
import claudeIcon from "../assets/claude.svg";
import githubIcon from "../assets/github.svg";
import sourceIcon from "../assets/source.svg";
import SidebarButton from "./SidebarButton.vue";
import { essays } from "../data/essays";

defineProps<{
  jobs: { slug: string; title: string }[];
  projects: { slug: string; title: string }[];
  currentSlug: string;
  collapsed: boolean;
}>();

const emit = defineEmits<{ navigate: [slug: string]; toggle: [] }>();

const buildDate = __BUILD_DATE__;
</script>

<template>
  <aside :class="{ collapsed: collapsed }">
    <div class="sidebar-inner">
      <div class="row top-row">
        <a
          v-if="!collapsed"
          class="title-block"
          href="#"
          @click.prevent="emit('navigate', 'about')"
        >
          <span>Jason Lernerman</span>
          <span class="subtitle">is looking for a job.</span>
        </a>

        <button @click="emit('toggle')" class="icon-btn">
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
      </div>

      <div class="new-chat-row">
        <SidebarButton
          :icon="bookIcon"
          label="About Jason"
          :collapsed="collapsed"
          :active="currentSlug === 'about'"
          @click="emit('navigate', 'about')"
        />
        <SidebarButton
          :icon="codeIcon"
          label="Notable OSS Contributions"
          :collapsed="collapsed"
          :active="currentSlug === 'oss'"
          @click="emit('navigate', 'oss')"
        />
        <SidebarButton
          :icon="githubIcon"
          label="Jason's Github"
          href="https://github.com/u9g"
          :collapsed="collapsed"
        />
        <SidebarButton
          :icon="contactIcon"
          label="Contact Jason"
          href="https://www.linkedin.com/in/jason-lernerman/"
          :collapsed="collapsed"
        />
      </div>

      <div v-if="!collapsed" class="recent-section">
        <span class="recent-heading">Jason's Job Experience</span>
        <button
          v-for="conv in jobs"
          :key="conv.slug"
          class="recent-item"
          :class="{ active: conv.slug === currentSlug }"
          @click="emit('navigate', conv.slug)"
        >
          {{ conv.title }}
        </button>
      </div>

      <div v-if="!collapsed" class="recent-section">
        <span class="recent-heading">Essays</span>
        <button
          v-for="essay in essays"
          :key="essay.slug"
          class="recent-item"
          :class="{ active: essay.slug === currentSlug }"
          @click="emit('navigate', essay.slug)"
        >
          {{ essay.title }}
        </button>
      </div>

      <div v-if="!collapsed" class="recent-section">
        <span class="recent-heading">Jason's Personal Projects</span>
        <button
          v-for="conv in projects"
          :key="conv.slug"
          class="recent-item"
          :class="{ active: conv.slug === currentSlug }"
          @click="emit('navigate', conv.slug)"
        >
          {{ conv.title }}
        </button>
      </div>

      <p v-if="!collapsed" class="attribution">
        This website's theme and design were heavily inspired by<br />
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          class="attribution-link"
          >Anthropic's Claude
          <img
            :src="claudeIcon"
            class="claude-logo"
            aria-hidden="true"
          />&nbsp;↗</a
        >
      </p>

      <div v-if="!collapsed" class="source-link">
        <SidebarButton
          :icon="sourceIcon"
          label="See the code"
          href="https://github.com/u9g/jason-portfolio"
          :collapsed="collapsed"
        />
      </div>

      <span v-if="!collapsed" class="last-updated"
        >Last updated: {{ buildDate }}</span
      >
    </div>
    <div v-if="!collapsed" class="overlay-backdrop" @click="emit('toggle')" />
  </aside>
</template>

<style lang="css" scoped>
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  height: 56px;
  font-size: large;
}

.title-block {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  text-decoration: none;
  color: inherit;
}

.subtitle {
  font-size: 0.7rem;
  color: var(--text-dim);
}

/* Overlay mode (small screens, default) */
aside {
  width: 0;
  flex-shrink: 0;
  position: relative;
}

.sidebar-inner {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-base);
  z-index: 10;
  transform: translateX(0);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.collapsed .sidebar-inner {
  transform: translateX(-100%);
}

.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  touch-action: none;
  overflow: hidden;
}

/* Inline mode (screens wider than iPad) */
@media (min-width: 1025px) {
  aside {
    width: 260px;
    overflow: hidden;
    border-right: 1px solid var(--border-color);
    transition: width 0.2s ease;
  }

  aside.collapsed {
    width: calc(32px + 1em);
  }

  .sidebar-inner {
    position: static;
    min-width: 260px;
    height: 100%;
    z-index: auto;
  }

  .collapsed .sidebar-inner {
    width: 100%;
    min-width: 0;
    transform: none;
  }

  .overlay-backdrop {
    display: none;
  }
}

button {
  background: transparent;
}

button:hover {
  background: var(--bg-hover);
}

button {
  cursor: pointer;

  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.icon-btn {
  width: 32px;
  height: 32px;

  border-radius: 10px;

  color: var(--text-muted);
}

.new-chat-row {
  padding: 0 8px;
}

.recent-section {
  display: flex;
  flex-direction: column;
  padding: 8px 8px 0;
  gap: 2px;
  overflow-y: auto;
  min-height: 0;
}

.recent-heading {
  font-size: 0.7rem;
  color: var(--text-dim);
  padding: 4px 6px;
  user-select: none;
}

.recent-item {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 8px;
  padding: 0 8px;
  height: 32px;
  text-align: left;
}

.recent-item:hover {
  color: var(--text-bright);
}

.recent-item.active {
  background: var(--bg-hover);
  color: var(--text-bright);
}


.attribution {
  margin-top: auto;
  margin-bottom: 0;
  padding: 16px 16px 0;
  font-size: 0.75rem;
  color: var(--text-dim);
  text-align: center;
  line-height: 1.6;
}

.attribution-link {
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 1px solid var(--text-muted);
  padding-bottom: 1px;
}

.attribution-link:hover {
  color: var(--text-bright);
  border-bottom-color: var(--text-bright);
}

.claude-logo {
  width: 0.75rem;
  height: 0.75rem;
  vertical-align: middle;
  margin-left: 2px;
}

.source-link {
  padding: 6px 8px 0;
}

.source-link :deep(.sidebar-btn) {
  position: relative;
  justify-content: center;
  height: auto;
  padding-top: 6px;
  padding-bottom: 6px;
}

.source-link :deep(.label) {
  flex: none;
}

.source-link :deep(.external-icon) {
  position: absolute;
  right: 12px;
}

.last-updated {
  display: block;
  padding: 4px 16px;
  font-size: 0.65rem;
  color: var(--text-dim);
  text-align: center;
}
</style>
