<script setup lang="ts">
import PromptBar from "./PromptBar.vue";
import SidebarHeader from "./SidebarHeader.vue";
import { renderMessage } from "../../data/render-markdown";
import { entryLogos, darkInvertLogos } from "../../data/entry-logos";

defineProps<{
  title: string;
  slug: string;
  conversation: { role: string; message: string }[];
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();
</script>

<template>
  <div class="conversation">
    <SidebarHeader
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="emit('toggleSidebar')"
    >
      <img
        v-if="entryLogos[slug]"
        :class="['title-logo', { 'title-logo--dark-invert': darkInvertLogos.has(slug) }]"
        :src="entryLogos[slug]"
        alt=""
        aria-hidden="true"
      />
      {{ title }}
    </SidebarHeader>
    <div class="messages">
      <div
        v-for="(msg, i) in conversation"
        :key="i"
        :class="['message', msg.role]"
      >
        <span v-html="renderMessage(msg.message)"></span>
      </div>
    </div>

    <PromptBar />
  </div>
</template>

<style lang="css" scoped>
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-width: 724px;
  margin: 0 auto;
  width: 100%;
}

.title-logo {
  width: auto;
  height: 18px;
  max-width: 22px;
  object-fit: contain;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
}

:root[data-theme="dark"] .title-logo--dark-invert {
  filter: invert(1);
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 300;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.message.user {
  align-self: flex-end;
  background: var(--bg-hover);
  color: var(--text-bright);
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.message :deep(a) {
  color: var(--text-bright);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.message :deep(a:hover) {
  color: var(--text-muted);
}

.message :deep(code) {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85em;
  background: var(--bg-hover);
  color: var(--text-bright);
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.message.user :deep(code) {
  background: var(--bg-base);
}</style>
