<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Conversation from "./components/Conversation.vue";
import About from "./components/About.vue";
import OSSContributions from "./components/OSSContributions.vue";
import ReadmeView from "./components/ReadmeView.vue";
import conversations from "./data/conversations.json";

const bannerDismissed = ref(false);

const DEFAULT_SLUG = "readme";

function slugFromHash(hash: string): string {
  const raw = hash.slice(1) || DEFAULT_SLUG;
  if (raw === "readme" || raw.startsWith("readme-")) return "readme";
  return raw;
}

const currentSlug = ref(slugFromHash(window.location.hash));

const isOverlay = !window.matchMedia("(min-width: 1025px)").matches;
const sidebarCollapsed = ref(isOverlay);

watchEffect(() => {
  if (currentSlug.value === DEFAULT_SLUG) {
    history.replaceState(null, "", window.location.pathname);
  } else {
    window.location.hash = currentSlug.value;
  }
});

window.addEventListener("hashchange", () => {
  currentSlug.value = slugFromHash(window.location.hash);
});

const allConversations = [...conversations.jobs, ...conversations.projects];

const currentConversation = computed(() =>
  allConversations.find((x) => x.slug === currentSlug.value),
);
</script>

<template>
  <ReadmeView v-if="currentSlug === 'readme'" />
  <div class="layout-wrap" v-else-if="currentSlug === 'about' || currentSlug === 'oss' || currentConversation">
    <div v-if="!bannerDismissed" class="doc-banner">
      <a href="#readme">View as document</a>
      <button class="banner-dismiss" @click="bannerDismissed = true">✕</button>
    </div>
    <div class="layout">
    <Sidebar
      :jobs="conversations.jobs"
      :projects="conversations.projects"
      :current-slug="currentSlug"
      :collapsed="sidebarCollapsed"
      @navigate="currentSlug = $event; if (isOverlay) sidebarCollapsed = true"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <About
      v-if="currentSlug === 'about'"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      @navigate="currentSlug = $event"
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
    <button class="white-btn" @click="currentSlug = DEFAULT_SLUG">Go back home</button>
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
