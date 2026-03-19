<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  href?: string;
  collapsed: boolean;
  active?: boolean;
}>();
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="['sidebar-btn', { active }]"
  >
    <span class="icon-circle">
      <img :src="icon" style="flex-shrink: 0" />
    </span>
    <span v-if="!collapsed" class="label">{{ label }}</span>
    <svg
      v-if="!collapsed"
      class="external-icon"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 1.5H10.5V8.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.5 1.5L1.5 10.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </a>
  <button v-else :class="['sidebar-btn', { active }]" @click="$emit('click')">
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

.sidebar-btn:hover,
.sidebar-btn.active {
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

.label {
  flex: 1;
  text-align: left;
}

.external-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar-btn:hover .external-icon {
  opacity: 1;
}
</style>
