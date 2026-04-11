<script setup lang="ts">
import { computed } from "vue";
import ShareButton from "./ShareButton.vue";
import SidebarToggleButton from "./SidebarToggleButton.vue";
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
      <SidebarToggleButton
        v-if="sidebarCollapsed"
        @click="emit('toggleSidebar')"
      />
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
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
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
