<script setup lang="ts">
import { computed } from "vue";
import type { AppSection, StartMenuAction, StartMenuApp } from "./start-menu.types";

const props = defineProps<{
  apps: StartMenuApp[];
}>();

const emit = defineEmits<{
  "open-letter-picker": [];
  "app-click": [action: StartMenuAction];
}>();

const appSections = computed<AppSection[]>(() => {
  const grouped = new Map<string, StartMenuApp[]>();

  for (const app of props.apps) {
    const letter = app.name.charAt(0).toUpperCase();
    const entries = grouped.get(letter) ?? [];
    entries.push(app);
    grouped.set(letter, entries);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, entries]) => ({
      letter,
      entries: [...entries].sort((a, b) => a.name.localeCompare(b.name)),
    }));
});
</script>

<template>
  <div class="app-list-view applications-view">
    <section
      v-for="(section, sectionIndex) in appSections"
      :key="section.letter"
      class="app-section"
      :data-letter="section.letter"
    >
      <button
        class="app-list-header"
        type="button"
        :style="{ animationDelay: `${sectionIndex * 20}ms` }"
        @click="emit('open-letter-picker')"
      >
        <span>{{ section.letter }}</span>
      </button>
      <button
        v-for="(app, appIndex) in section.entries"
        :key="app.name"
        class="app-item slide-up"
        :style="{ animationDelay: `${sectionIndex * 30 + appIndex * 30}ms` }"
        @click="emit('app-click', app.action)"
      >
        <img :src="app.icon" alt="" class="app-icon-img" />
        <span class="app-name">{{ app.name }}</span>
      </button>
    </section>
  </div>
</template>

<style lang="css" scoped>
.app-list-view {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.applications-view {
  padding: 8px 0;
}

.app-section {
  display: flex;
  flex-direction: column;
}

.app-list-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: inherit;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  text-align: left;
}

.app-list-header:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.app-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: white;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.app-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.app-icon-img {
  width: 24px;
  height: 24px;
}

.slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
