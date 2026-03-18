<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  href?: string;
  collapsed: boolean;
}>();
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="sidebar-btn"
  >
    <span class="icon-circle">
      <img :src="icon" style="flex-shrink: 0" />
    </span>
    <span v-if="!collapsed">{{ label }}</span>
  </a>
  <button v-else class="sidebar-btn">
    <span class="icon-circle">
      <img :src="icon" style="flex-shrink: 0" />
    </span>
    <span v-if="!collapsed">{{ label }}</span>
  </button>
</template>

<style lang="css" scoped>
.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  white-space: nowrap;
  border-radius: 10px;
  padding: 3px 12px 3px 6px;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
  font-size: 0.8rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.sidebar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-bright);
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: var(--bg-icon);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sidebar-btn:hover .icon-circle {
  transform: scale(1.1);
}

.icon-circle img {
  width: 14px;
  height: 14px;
  filter: brightness(0) invert(0.75);
  transition: filter 0.2s ease;
}

.sidebar-btn:hover .icon-circle img {
  filter: brightness(0) invert(1);
}
</style>
