<script setup lang="ts">
import { computed } from "vue";
import ShareButton from "./ShareButton.vue";
import { getEssay } from "../data/essays";
import { renderMarkdown } from "../data/render-markdown";

const props = defineProps<{
  slug: string;
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

const essay = computed(() => getEssay(props.slug));
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
      Essays
      <ShareButton />
    </div>
    <div v-if="essay" class="essays-content">
      <div class="essay">
        <h2 class="essay-title">{{ essay.title }} <span class="essay-date">{{ essay.date }}</span></h2>
        <template v-for="(block, i) in essay.blocks" :key="i">
          <p v-if="block.type === 'p'" v-html="renderMarkdown(block.text)"></p>
          <li v-else-if="block.type === 'li'" v-html="renderMarkdown(block.text)"></li>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.essays-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem 2rem;
  min-width: 0;
  overflow-x: hidden;
}

.essay {
  max-width: 640px;
  margin: 0 auto;
}

.essay-title {
  font-size: 1.3rem;
  color: var(--text-bright);
  margin: 0 0 1rem;
}

.essay-date {
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--text-dim);
}

.essay p {
  font-size: 0.88rem;
  font-weight: 300;
  line-height: 1.75;
  color: var(--text-muted);
  margin: 0 0 1rem;
}

.essay :deep(a) {
  color: var(--text-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.essay :deep(a:hover) {
  color: var(--text-muted);
}

.essay li {
  font-size: 0.88rem;
  font-weight: 300;
  line-height: 1.75;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
  list-style-position: inside;
}

.essay :deep(em) {
  font-family: "Playfair Display", serif;
  font-style: italic;
  color: var(--text-bright);
}
</style>
