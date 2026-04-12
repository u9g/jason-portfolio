<script setup lang="ts">
import { ref, computed, watch } from "vue";
import WindowFrame from "./WindowFrame.vue";
import { useWindowManager } from "../../composables/useWindowManager";
import { entryLogos, darkInvertLogos } from "../../data/entry-logos";
import { renderMessage } from "../../data/render-markdown";

const props = defineProps<{
  windowId: string;
  windowTitle: string;
  windowIcon: string;
  items: { slug: string; title: string; conversation: { role: string; message: string }[] }[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { getWindow, focusWindow, minimizeWindow } = useWindowManager();
const defaultState = { open: false, minimized: false, focused: false, zIndex: 15 };
const wState = computed(() => getWindow(props.windowId) ?? defaultState);

const selectedSlug = ref(props.items[0]?.slug ?? "");
const selected = computed(() => props.items.find((i) => i.slug === selectedSlug.value));
const detailPane = ref<HTMLElement | null>(null);

watch(selectedSlug, () => {
  if (detailPane.value) detailPane.value.scrollTop = 0;
});
</script>

<template>
  <WindowFrame
    :open="wState.open"
    :minimized="wState.minimized"
    :focused="wState.focused"
    :z-index="wState.zIndex"
    :title="windowTitle"
    :icon="windowIcon"
    @close="emit('close')"
    @minimize="minimizeWindow(windowId)"
    @focus="focusWindow(windowId)"
  >
    <div class="conv-window">
      <div class="item-list">
        <button
          v-for="item in items"
          :key="item.slug"
          class="item-entry"
          :class="{ active: item.slug === selectedSlug }"
          @click="selectedSlug = item.slug"
        >
          <img
            v-if="entryLogos[item.slug]"
            :src="entryLogos[item.slug]"
            :class="['item-logo', { 'dark-invert': darkInvertLogos.has(item.slug) }]"
            alt=""
          />
          <div v-else class="item-logo-placeholder" />
          <span class="item-label">{{ item.title }}</span>
        </button>
      </div>

      <div ref="detailPane" class="detail-pane">
        <template v-if="selected">
          <div class="detail-header">
            <img
              v-if="entryLogos[selected.slug]"
              :src="entryLogos[selected.slug]"
              :class="['detail-logo', { 'dark-invert': darkInvertLogos.has(selected.slug) }]"
              alt=""
            />
            <h2 class="detail-title">{{ selected.title }}</h2>
          </div>
          <div class="messages">
            <template v-for="(msg, i) in selected.conversation" :key="i">
              <div v-if="msg.role === 'user'" class="msg-question">{{ msg.message }}</div>
              <div v-else class="msg-answer" v-html="renderMessage(msg.message)" />
            </template>
          </div>
        </template>
      </div>
    </div>
  </WindowFrame>
</template>

<style lang="css" scoped>
.conv-window {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  font-family: "Segoe UI", -apple-system, sans-serif;
}

.item-list {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 4px 0;
}

.item-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  color: #333;
  font-family: inherit;
  border-left: 3px solid transparent;
}

.item-entry:hover {
  background: #e8e8e8;
}

.item-entry.active {
  background: #fff;
  border-left-color: #0078d4;
  font-weight: 600;
}

.item-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.dark-invert {
  filter: none;
}

.item-logo-placeholder {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-pane {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px 28px;
  background: #fff;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg-question {
  font-size: 13px;
  font-weight: 600;
  color: #0078d4;
}

.msg-answer {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  padding-left: 0;
  margin-bottom: 4px;
}

.msg-answer :deep(a) {
  color: #0078d4;
  text-decoration: none;
}

.msg-answer :deep(a:hover) {
  text-decoration: underline;
}

.msg-answer :deep(code) {
  font-family: "Cascadia Code", "Consolas", monospace;
  font-size: 12px;
  background: #f0f0f0;
  padding: 1px 5px;
  border-radius: 3px;
}

.msg-answer :deep(.arrow) {
  display: inline-block;
  width: 10px;
  height: 10px;
  vertical-align: baseline;
}

.msg-answer :deep(.arrow svg) {
  width: 10px;
  height: 10px;
}
</style>
