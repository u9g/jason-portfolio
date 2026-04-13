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
  width: 78px;
  box-sizing: border-box;
  text-align: center;
  padding: 4px 2px 3px;
  border-radius: 1px;
  cursor: default;
  border: 1px solid transparent;
}

.desktop-icon:not(.selected):hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

.desktop-icon.selected {
  background: rgba(0, 120, 215, 0.28);
  border-color: rgba(255, 255, 255, 0.3);
}

.desktop-icon.selected:hover {
  background: rgba(0, 120, 215, 0.34);
  border-color: rgba(255, 255, 255, 0.38);
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
  margin-top: 5px;
  padding: 0 2px 1px;
  font-size: 12px;
  font-weight: 400;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  font-family: "Segoe UI", Tahoma, sans-serif;
  line-height: 1.2;
  overflow-wrap: break-word;
}
</style>
