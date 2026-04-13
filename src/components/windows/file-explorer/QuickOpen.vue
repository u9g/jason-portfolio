<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { fetchTree, type GHEntry } from "../../../data/github-fs";

const props = defineProps<{
  open: boolean;
  currentRepo: string;
}>();

const emit = defineEmits<{
  close: [];
  select: [entry: GHEntry];
}>();

const query = ref("");
const allFiles = ref<GHEntry[]>([]);
const loading = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

const results = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return allFiles.value.filter((e) => e.type === "file").slice(0, 50);
  const terms = q.split(/\s+/);
  return allFiles.value
    .filter((e) => {
      if (e.type !== "file") return false;
      const lower = e.path.toLowerCase();
      return terms.every((t) => lower.includes(t));
    })
    .slice(0, 50);
});

watch(() => props.open, async (isOpen) => {
  if (!isOpen) {
    query.value = "";
    selectedIndex.value = 0;
    return;
  }
  await nextTick();
  inputEl.value?.focus();
  if (allFiles.value.length === 0) {
    loading.value = true;
    try {
      allFiles.value = await fetchTree(props.currentRepo);
    } catch {
      allFiles.value = [];
    } finally {
      loading.value = false;
    }
  }
});

watch(() => props.currentRepo, () => {
  allFiles.value = [];
});

watch(query, () => {
  selectedIndex.value = 0;
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const entry = results.value[selectedIndex.value];
    if (entry) emit("select", entry);
  } else if (e.key === "Escape") {
    emit("close");
  }
}

function selectEntry(entry: GHEntry) {
  emit("select", entry);
}
</script>

<template>
  <div v-if="open" class="quick-open-overlay" @mousedown.self="emit('close')">
    <div class="quick-open">
        <div class="quick-open-input-row">
          <svg class="quick-open-search-icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#999" stroke-width="1.5">
            <circle cx="6.5" cy="6.5" r="5" /><path d="M10.5 10.5L14 14" stroke-linecap="round" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            class="quick-open-input"
            placeholder="Search files by name..."
            @keydown="onKeydown"
          />
          <kbd class="quick-open-kbd">esc</kbd>
        </div>
        <div class="quick-open-results">
          <div v-if="loading" class="quick-open-status">Loading file tree...</div>
          <div v-else-if="results.length === 0" class="quick-open-status">No files found</div>
          <button
            v-for="(entry, i) in results"
            :key="entry.path"
            class="quick-open-item"
            :class="{ selected: i === selectedIndex }"
            @click="selectEntry(entry)"
            @mouseenter="selectedIndex = i"
          >
            <span class="quick-open-name">{{ entry.name }}</span>
            <span class="quick-open-path">{{ entry.path }}</span>
          </button>
        </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.quick-open-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
  display: flex;
  justify-content: center;
  padding-top: 80px;
}

.quick-open {
  width: 500px;
  max-height: 400px;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-self: flex-start;
}

.quick-open-input-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.quick-open-search-icon {
  flex-shrink: 0;
}

.quick-open-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: "Segoe UI", -apple-system, sans-serif;
  color: #333;
  background: transparent;
}

.quick-open-input::placeholder {
  color: #999;
}

.quick-open-kbd {
  font-size: 10px;
  color: #888;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 1px 5px;
  font-family: inherit;
}

.quick-open-results {
  overflow-y: auto;
  flex: 1;
}

.quick-open-status {
  padding: 16px;
  color: #888;
  font-size: 13px;
  text-align: center;
}

.quick-open-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  color: #333;
}

.quick-open-item.selected {
  background: #0078d4;
  color: #fff;
}

.quick-open-item.selected .quick-open-path {
  color: rgba(255, 255, 255, 0.7);
}

.quick-open-name {
  flex-shrink: 0;
  font-weight: 500;
}

.quick-open-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #888;
  font-size: 11px;
}
</style>
