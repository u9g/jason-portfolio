<script setup lang="ts">
import defaultIcon from "../../assets/file-explorer.svg";

defineProps<{
  label: string;
  selected: boolean;
  icon?: string;
}>();
</script>

<template>
  <div class="desktop-icon" :class="{ selected }">
    <img :src="icon ?? defaultIcon" alt="" class="icon-image" />
    <span class="icon-label">{{ label }}</span>
  </div>
</template>

<style lang="css" scoped>
.desktop-icon {
  width: 76px;
  text-align: center;
  padding: 0;
  border-radius: 2px;
  cursor: default;
  user-select: none;
  border: 1px solid transparent;
}

.desktop-icon.selected,
.desktop-icon:not(.selected):hover {
  background: rgba(150, 180, 230, 0.5);
  border-color: rgba(150, 180, 230, 0.7);
}

.desktop-icon.selected:hover {
  background: rgba(150, 180, 230, 0.6);
  border-color: rgba(150, 180, 230, 0.8);
}

.icon-image {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto;
  pointer-events: none;
}

.icon-label {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: white;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.9),
    -1px -1px 2px rgba(0, 0, 0, 0.9),
    1px -1px 2px rgba(0, 0, 0, 0.9),
    -1px 1px 2px rgba(0, 0, 0, 0.9),
    0 0 4px rgba(0, 0, 0, 0.7);
  font-family: "Segoe UI", -apple-system, sans-serif;
  line-height: 1.3;
  word-wrap: break-word;
}
</style>
