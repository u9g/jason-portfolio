<script setup lang="ts">
import ShareButton from "./ShareButton.vue";
import SidebarToggleButton from "./SidebarToggleButton.vue";

defineProps<{ sidebarCollapsed: boolean }>();
const emit = defineEmits<{ toggleSidebar: [] }>();
</script>

<template>
  <div class="top-bar">
    <SidebarToggleButton
      v-if="sidebarCollapsed"
      @click="emit('toggleSidebar')"
    />
    <slot />
    <ShareButton />
  </div>
</template>

<style scoped>
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
</style>
