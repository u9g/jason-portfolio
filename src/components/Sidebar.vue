<script setup lang="ts">
import { ref } from "vue";
import sidebarToggleIcon from "../assets/sidebar-toggle.svg";
import plusIcon from "../assets/plus.svg";
import contactIcon from "../assets/contact.svg";
import SidebarButton from "./SidebarButton.vue";

defineProps<{
  conversations: { slug: string; title: string }[];
  currentSlug: string;
}>();

const emit = defineEmits<{ navigate: [slug: string] }>();

const isCollapsed = ref(false);
</script>

<template>
  <aside :class="{ collapsed: isCollapsed }">
    <div class="sidebar-inner">
      <div class="row top-row">
        <div v-if="!isCollapsed" class="title-block">
          <span>Jason Lernerman</span>
          <span class="subtitle">is looking for a job.</span>
        </div>

        <button @click="isCollapsed = !isCollapsed" class="icon-btn">
          <img
            :src="sidebarToggleIcon"
            class="transition text-text-400 group-hover:text-text-100"
            style="flex-shrink: 0; filter: brightness(0) invert(1)"
          />
        </button>
      </div>

      <div class="new-chat-row">
        <SidebarButton :icon="plusIcon" label="New Chat" :collapsed="isCollapsed" />
        <SidebarButton :icon="contactIcon" label="Contact Jason" href="https://www.linkedin.com/in/jason-lernerman/" :collapsed="isCollapsed" />
      </div>

      <div v-if="!isCollapsed" class="recent-section">
        <span class="recent-heading">Recent Job Experience</span>
        <button
          v-for="conv in conversations"
          :key="conv.slug"
          class="recent-item"
          :class="{ active: conv.slug === currentSlug }"
          @click="emit('navigate', conv.slug)"
        >
          {{ conv.title }}
        </button>
      </div>
    </div>
    <div
      v-if="!isCollapsed"
      class="overlay-backdrop"
      @click="isCollapsed = true"
    />
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
}

.subtitle {
  font-size: 0.7rem;
  color: var(--text-dim);
}

/* Overlay mode (small screens, default) */
aside {
  width: calc(32px + 1em);
  flex-shrink: 0;
  position: relative;
}

.sidebar-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-base);
  z-index: 10;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapsed .sidebar-inner {
  width: calc(32px + 1em);
}

.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
}

/* Inline mode (screens wider than iPad) */
@media (min-width: 1025px) {
  aside {
    width: 260px;
    overflow: hidden;
    border-right: 1px solid var(--border-color);
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  aside.collapsed {
    width: calc(32px + 1em);
  }

  .sidebar-inner {
    position: static;
    min-width: 260px;
    height: auto;
    z-index: auto;
  }

  .collapsed .sidebar-inner {
    width: auto;
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

  color: var(--text-bright);
}

.new-chat-row {
  padding: 0 8px;
}



.recent-section {
  display: flex;
  flex-direction: column;
  padding: 8px 8px 0;
  gap: 2px;
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
</style>
