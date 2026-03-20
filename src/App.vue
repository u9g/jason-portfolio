<script setup lang="ts">
import { computed, ref } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Conversation from "./components/Conversation.vue";
import About from "./components/About.vue";
import OSSContributions from "./components/OSSContributions.vue";
import ReadmeView from "./components/ReadmeView.vue";
import conversations from "./data/conversations.json";

const bannerDismissed = ref(false);

const theme = ref(localStorage.getItem("theme") || "dark");

function applyTheme(t: string) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
}
applyTheme(theme.value);

function toggleTheme(e: MouseEvent) {
  const btn = e.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  document.documentElement.style.setProperty("--wave-cx", `${cx}px`);
  document.documentElement.style.setProperty("--wave-cy", `${cy}px`);

  const newTheme = theme.value === "dark" ? "light" : "dark";

  // Use View Transitions API if available, fallback to instant
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      theme.value = newTheme;
      applyTheme(newTheme);
    });
  } else {
    theme.value = newTheme;
    applyTheme(newTheme);
  }
}

const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
const isReadmeMode = pathname === "/" || pathname === "/index.html";

const DEFAULT_SLUG = "about";

function slugFromPath(path: string): string {
  const match = path.match(/^\/claude\/(.+)/);
  return match ? match[1] : DEFAULT_SLUG;
}

const currentSlug = ref(slugFromPath(pathname));

const isOverlay = !window.matchMedia("(min-width: 1025px)").matches;
const sidebarCollapsed = ref(isOverlay);

function navigateTo(slug: string) {
  currentSlug.value = slug;
  const url = slug === DEFAULT_SLUG ? "/claude" : `/claude/${slug}`;
  history.pushState(null, "", url);
}

window.addEventListener("popstate", () => {
  currentSlug.value = slugFromPath(window.location.pathname);
});

const allConversations = [...conversations.jobs, ...conversations.projects];

const currentConversation = computed(() =>
  allConversations.find((x) => x.slug === currentSlug.value),
);
</script>

<template>
  <button class="theme-fab" @click="toggleTheme($event)">{{ theme === 'dark' ? '☀' : '☾' }}</button>
  <ReadmeView v-if="isReadmeMode" />
  <div class="layout-wrap" v-else-if="currentSlug === 'about' || currentSlug === 'oss' || currentConversation">
    <div v-if="!bannerDismissed" class="doc-banner">
      <a href="/">View as document</a>
      <button class="banner-dismiss" @click="bannerDismissed = true">✕</button>
    </div>
    <div class="layout">
    <Sidebar
      :jobs="conversations.jobs"
      :projects="conversations.projects"
      :current-slug="currentSlug"
      :collapsed="sidebarCollapsed"
      @navigate="navigateTo($event); if (isOverlay) sidebarCollapsed = true"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <About
      v-if="currentSlug === 'about'"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      @navigate="navigateTo($event)"
    />
    <OSSContributions
      v-else-if="currentSlug === 'oss'"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
    />
    <Conversation
      v-else-if="currentConversation"
      :slug="currentSlug"
      :title="currentConversation.title"
      :conversation="currentConversation.conversation"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
    />
    </div>
  </div>
  <div v-else class="not-found">
    <h1>Page not found</h1>
    <p>
      There's many pages of info about Jason here, but this isn't one of them.
    </p>
    <a class="white-btn" href="/">Go back home</a>
  </div>
</template>

<style>
:root {
  --text-bright: #faf9f5;
  --text-muted: #c2c0b6;
  --text-mid: #9c9a92;
  --text-dim: #6b6a65;
  --bg-base: #262624;
  --bg-raised: #30302e;
  --bg-hover: #141413;
  --bg-icon: #383735;
  --bg-hover-light: #2a2a28;
  --border-color: #42413d;
}

[data-theme="light"] {
  --text-bright: #2c2c2a;
  --text-muted: #5c5c58;
  --text-mid: #7a7a76;
  --text-dim: #a3a39e;
  --bg-base: #e8e7e2;
  --bg-raised: #deddd8;
  --bg-hover: #d1d0cb;
  --bg-icon: #d6d5d0;
  --bg-hover-light: #e3e2dd;
  --border-color: #c2c1bc;
}

::view-transition-old(root) {
  animation: none;
  z-index: 1;
}

::view-transition-new(root) {
  animation: wave-reveal 600ms ease-out;
  z-index: 2;
}

@keyframes wave-reveal {
  from {
    clip-path: circle(0% at var(--wave-cx) var(--wave-cy));
  }
  to {
    clip-path: circle(150% at var(--wave-cx) var(--wave-cy));
  }
}

html,
body,
#app {
  margin: 0;
  padding: 0;

  background: var(--bg-base);
  color: var(--text-bright);
  font-family: "Lora", serif;
}

</style>

<style lang="css" scoped>
.layout-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.doc-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 6px 16px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.doc-banner a {
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.doc-banner a:hover {
  color: var(--text-bright);
}

.banner-dismiss {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.banner-dismiss:hover {
  color: var(--text-bright);
}

.theme-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-raised);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.theme-fab:hover {
  color: var(--text-bright);
  border-color: var(--text-dim);
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  min-height: 100vh;
  color: var(--text-muted);
}

.not-found h1 {
  font-size: 4rem;
  margin: 0;
}
</style>
