<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { fetchContents, fetchFileContent, type GHEntry } from "../../data/github-fs";
import fileExplorerIcon from "../../assets/file-explorer.svg";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const currentPath = ref("");
const entries = ref<GHEntry[]>([]);
const loading = ref(false);
const error = ref("");

const viewingFile = ref(false);
const fileContent = ref("");
const fileName = ref("");
const fileLoading = ref(false);

const posX = ref(100);
const posY = ref(60);
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function onMouseDown(e: MouseEvent) {
  dragging = true;
  dragOffsetX = e.clientX - posX.value;
  dragOffsetY = e.clientY - posY.value;
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return;
  posX.value = e.clientX - dragOffsetX;
  posY.value = e.clientY - dragOffsetY;
}

function onMouseUp() {
  dragging = false;
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});

async function loadDir(path: string) {
  loading.value = true;
  error.value = "";
  viewingFile.value = false;
  try {
    entries.value = await fetchContents(path);
    currentPath.value = path;
  } catch {
    error.value = "Failed to load directory";
  } finally {
    loading.value = false;
  }
}

async function openFile(entry: GHEntry) {
  fileLoading.value = true;
  fileName.value = entry.name;
  viewingFile.value = true;
  try {
    fileContent.value = await fetchFileContent(entry.path);
  } catch {
    fileContent.value = "Failed to load file content.";
  } finally {
    fileLoading.value = false;
  }
}

function onEntryClick(entry: GHEntry) {
  if (entry.type === "dir") {
    loadDir(entry.path);
  } else {
    openFile(entry);
  }
}

function goUp() {
  if (viewingFile.value) {
    viewingFile.value = false;
    return;
  }
  const parts = currentPath.value.split("/");
  parts.pop();
  loadDir(parts.join("/"));
}

const pathSegments = ref<{ label: string; path: string }[]>([]);

watch(currentPath, (p) => {
  const segs: { label: string; path: string }[] = [
    { label: "jason-portfolio", path: "" },
  ];
  if (p) {
    const parts = p.split("/");
    for (let i = 0; i < parts.length; i++) {
      segs.push({
        label: parts[i],
        path: parts.slice(0, i + 1).join("/"),
      });
    }
  }
  pathSegments.value = segs;
}, { immediate: true });

loadDir("");

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    ts: "TypeScript File", js: "JavaScript File", vue: "Vue File",
    json: "JSON File", css: "CSS File", html: "HTML File",
    md: "Markdown File", svg: "SVG File", mjs: "JavaScript File",
    png: "PNG Image", jpg: "JPEG Image", jpeg: "JPEG Image",
    txt: "Text File", yml: "YAML File", yaml: "YAML File",
  };
  return types[ext ?? ""] ?? "File";
}

interface NavNode {
  label: string;
  icon: "pin" | "folder" | "pc" | "drive";
  path: string | null;
  expanded: boolean;
  children?: NavNode[];
}

const navTree = ref<NavNode[]>([
  {
    label: "Quick access", icon: "pin", path: null, expanded: true,
    children: [
      { label: "src", icon: "folder", path: "src", expanded: false },
    ],
  },
  {
    label: "This PC", icon: "pc", path: null, expanded: true,
    children: [
      { label: "jason-portfolio (D:)", icon: "drive", path: "", expanded: false },
    ],
  },
]);

function onNavClick(node: NavNode) {
  if (node.path !== null) {
    loadDir(node.path);
  } else if (node.children) {
    node.expanded = !node.expanded;
  }
}
</script>

<template>
  <Transition name="explorer">
    <div
      v-if="open"
      class="explorer-window"
      :style="{ left: posX + 'px', top: posY + 'px' }"
      @click.stop
    >
      <!-- Title bar -->
      <div class="title-bar" @mousedown="onMouseDown">
        <img :src="fileExplorerIcon" class="title-icon" alt="" />
        <span class="title-text">{{ viewingFile ? fileName : 'File Explorer' }}</span>
        <div class="title-buttons">
          <button class="title-btn" aria-label="Minimize">
            <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="6" x2="11" y2="6" stroke="#333" stroke-width="1" /></svg>
          </button>
          <button class="title-btn" aria-label="Maximize">
            <svg viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="#333" stroke-width="1" /></svg>
          </button>
          <button class="title-btn close" aria-label="Close" @click="emit('close')">
            <svg viewBox="0 0 12 12" width="10" height="10">
              <line x1="1" y1="1" x2="11" y2="11" stroke="#333" stroke-width="1.2" />
              <line x1="11" y1="1" x2="1" y2="11" stroke="#333" stroke-width="1.2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Navigation toolbar -->
      <div class="toolbar">
        <div class="nav-buttons">
          <button
            class="nav-btn"
            :disabled="currentPath === '' && !viewingFile"
            @click="goUp"
            aria-label="Back"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 2L4 8l6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="nav-btn" disabled aria-label="Forward">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            class="nav-btn"
            :disabled="currentPath === '' && !viewingFile"
            @click="goUp"
            aria-label="Up"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 10l6-6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="address-bar">
          <img :src="fileExplorerIcon" class="address-icon" alt="" />
          <template v-for="(seg, i) in pathSegments" :key="seg.path">
            <span v-if="i > 0" class="path-sep">›</span>
            <button class="path-segment" @click="loadDir(seg.path)">{{ seg.label }}</button>
          </template>
        </div>
      </div>

      <div class="body">
        <!-- Left navigation pane -->
        <div class="nav-pane">
          <template v-for="node in navTree" :key="node.label">
            <button class="nav-item depth-0" @click="onNavClick(node)">
              <span class="nav-arrow" :class="{ expanded: node.expanded, hidden: !node.children }">›</span>
              <svg v-if="node.icon === 'pin'" class="nav-icon" viewBox="0 0 16 16"><path d="M3 1l5 5-2 2 4 4 2-2 3 3-1 1-3-3-2 2-4-4-2 2z" fill="#e8b500"/></svg>
              <svg v-else-if="node.icon === 'pc'" class="nav-icon" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="9" rx="1" fill="#5ba4cf" stroke="#4a8ab5" stroke-width="0.5"/><rect x="5" y="11" width="6" height="1" fill="#888"/><rect x="4" y="12" width="8" height="1" rx="0.5" fill="#999"/></svg>
              <img v-else-if="node.icon === 'folder'" :src="fileExplorerIcon" class="nav-icon" alt="" />
              <span class="nav-label">{{ node.label }}</span>
            </button>
            <template v-if="node.expanded && node.children">
              <button
                v-for="child in node.children"
                :key="child.label"
                class="nav-item depth-1"
                @click="onNavClick(child)"
              >
                <span class="nav-arrow hidden">›</span>
                <svg v-if="child.icon === 'drive'" class="nav-icon" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="1" fill="#bbb" stroke="#999" stroke-width="0.5"/><rect x="2" y="9" width="3" height="1.5" rx="0.5" fill="#6a6"/></svg>
                <img v-else :src="fileExplorerIcon" class="nav-icon" alt="" />
                <span class="nav-label">{{ child.label }}</span>
              </button>
            </template>
          </template>
        </div>

        <!-- Main content -->
        <div class="content">
          <div v-if="loading" class="status-msg">Loading...</div>
          <div v-else-if="error" class="status-msg error">{{ error }}</div>
          <div v-else-if="viewingFile" class="file-viewer">
            <pre v-if="fileLoading">Loading file...</pre>
            <pre v-else>{{ fileContent }}</pre>
          </div>
          <template v-else>
            <!-- Column headers -->
            <div class="column-headers">
              <span class="col-name">Name</span>
              <span class="col-type">Type</span>
              <span class="col-size">Size</span>
            </div>
            <div class="file-list">
              <button
                v-for="entry in entries"
                :key="entry.path"
                class="file-entry"
                @click="onEntryClick(entry)"
              >
                <span class="col-name">
                  <img v-if="entry.type === 'dir'" :src="fileExplorerIcon" class="entry-icon" alt="" />
                  <svg v-else class="entry-icon" viewBox="0 0 24 24">
                    <path d="M6 2h8l6 6v14H6z" fill="#e8e8e8" stroke="#c0c0c0" stroke-width="0.8" />
                    <path d="M14 2v6h6" fill="none" stroke="#c0c0c0" stroke-width="0.8" />
                  </svg>
                  <span class="entry-label">{{ entry.name }}</span>
                </span>
                <span class="col-type">{{ entry.type === 'dir' ? 'File folder' : getFileType(entry.name) }}</span>
                <span class="col-size">{{ entry.type === 'file' ? formatSize(entry.size) : '' }}</span>
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span v-if="!viewingFile">{{ entries.length }} items</span>
        <span v-else>{{ fileName }}</span>
      </div>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
.explorer-window {
  position: absolute;
  width: 750px;
  height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #888;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  z-index: 15;
  font-family: "Segoe UI", -apple-system, sans-serif;
  font-size: 12px;
}

.explorer-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.explorer-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.explorer-enter-from,
.explorer-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Title bar — white like Win10 */
.title-bar {
  display: flex;
  align-items: center;
  height: 30px;
  background: #fff;
  padding: 0 4px 0 10px;
  cursor: default;
  flex-shrink: 0;
  user-select: none;
  border-bottom: 1px solid #e0e0e0;
}

.title-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.title-text {
  color: #333;
  font-size: 12px;
  flex: 1;
}

.title-buttons {
  display: flex;
}

.title-btn {
  width: 46px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-btn:hover {
  background: #e5e5e5;
}

.title-btn.close:hover {
  background: #e81123;
}

.title-btn.close:hover svg line {
  stroke: white;
}

/* Toolbar */
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

/* Body = nav pane + content */
.body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* Left navigation pane */
.nav-pane {
  width: 180px;
  background: #fff;
  border-right: 1px solid #ddd;
  padding: 4px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 2px 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: #333;
  text-align: left;
  white-space: nowrap;
}

.nav-item.depth-0 {
  padding-left: 4px;
}

.nav-item.depth-1 {
  padding-left: 24px;
}

.nav-item:hover {
  background: #e8e8e8;
}

.nav-arrow {
  width: 16px;
  text-align: center;
  font-size: 11px;
  color: #888;
  flex-shrink: 0;
  transition: transform 0.1s ease;
  display: inline-block;
}

.nav-arrow.expanded {
  transform: rotate(90deg);
}

.nav-arrow.hidden {
  visibility: hidden;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Content area */
.content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.status-msg {
  padding: 20px;
  color: #888;
}

.status-msg.error {
  color: #c00;
}

/* Column headers */
.column-headers {
  display: flex;
  padding: 4px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  color: #666;
  font-size: 11px;
  flex-shrink: 0;
}

.column-headers .col-name {
  flex: 2;
}

.column-headers .col-type {
  flex: 1;
}

.column-headers .col-size {
  width: 80px;
  text-align: right;
}

/* File list */
.file-list {
  flex: 1;
  overflow-y: auto;
}

.file-entry {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 3px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: #333;
  text-align: left;
}

.file-entry:hover {
  background: #e8f0fe;
}

.file-entry .col-name {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.file-entry .col-type {
  flex: 1;
  color: #666;
}

.file-entry .col-size {
  width: 80px;
  text-align: right;
  color: #666;
}

.entry-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* File viewer */
.file-viewer {
  padding: 12px;
  overflow: auto;
  flex: 1;
  background: #fff;
}

.file-viewer pre {
  margin: 0;
  color: #333;
  font-size: 12px;
  font-family: Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

/* Status bar */
.status-bar {
  height: 22px;
  background: #f1f1f1;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #666;
  font-size: 11px;
  flex-shrink: 0;
}
</style>
