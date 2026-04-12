<script setup lang="ts">
import type { PathSegment } from "./types";

defineProps<{
  canGoBack: boolean;
  canGoForward: boolean;
  canGoUp: boolean;
  pathSegments: PathSegment[];
}>();

const emit = defineEmits<{
  back: [];
  forward: [];
  up: [];
  "navigate-segment": [path: string];
}>();
</script>

<template>
  <div class="toolbar">
    <div class="nav-buttons">
      <button
        class="nav-btn"
        :disabled="!canGoBack"
        @click="emit('back')"
        aria-label="Back"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 2L4 8l6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button
        class="nav-btn"
        :disabled="!canGoForward"
        @click="emit('forward')"
        aria-label="Forward"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button
        class="nav-btn"
        :disabled="!canGoUp"
        @click="emit('up')"
        aria-label="Up"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 10l6-6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <div class="address-bar">
      <svg class="address-icon" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="9" rx="1" fill="#5ba4cf" stroke="#4a8ab5" stroke-width="0.5"/><rect x="5" y="11" width="6" height="1" fill="#888"/><rect x="4" y="12" width="8" height="1" rx="0.5" fill="#999"/></svg>
      <template v-for="(seg, i) in pathSegments" :key="seg.path">
        <span v-if="i > 0" class="path-sep">›</span>
        <button class="path-segment" @click="emit('navigate-segment', seg.path)">{{ seg.label }}</button>
      </template>
    </div>
  </div>
</template>

<style lang="css" scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  background: #f1f1f1;
  padding: 0 8px;
  gap: 6px;
  flex-shrink: 0;
  border-bottom: 1px solid #ddd;
}

.nav-buttons {
  display: flex;
  gap: 2px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  border-radius: 2px;
}

.nav-btn:hover:not(:disabled) {
  background: #ddd;
}

.nav-btn:disabled {
  color: #bbb;
  cursor: default;
}

.address-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  height: 26px;
  padding: 0 6px;
  border: 1px solid #ccc;
  overflow: hidden;
}

.address-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  flex-shrink: 0;
}

.path-sep {
  color: #999;
  margin: 0 2px;
  font-size: 11px;
}

.path-segment {
  background: transparent;
  border: none;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: inherit;
  white-space: nowrap;
}

.path-segment:hover {
  background: #e0e7f0;
}
</style>
