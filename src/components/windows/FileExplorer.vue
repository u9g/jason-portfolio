<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { fetchContents, fetchFileContent, fetchUserRepos, PINNED_REPOS, type GHEntry } from "../../data/github-fs";
import fileExplorerIcon from "../../assets/file-explorer.svg";
import WindowFrame from "./WindowFrame.vue";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "dismiss-menus": [];
}>();

const currentPath = ref("");
const entries = ref<GHEntry[]>([]);
const loading = ref(false);
const error = ref("");

const viewingFile = ref(false);
const fileContent = ref("");
const fileName = ref("");
const fileLoading = ref(false);
const viewingThisPC = ref(false);
const viewingDrive = ref(false);
const currentRepo = ref("jason-portfolio");

const historyStack = ref<string[]>([]);
const historyIndex = ref(-1);
const canGoBack = computed(() => historyIndex.value > 0);
const canGoForward = computed(() => historyIndex.value < historyStack.value.length - 1);

function pushHistory(path: string) {
  historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
  historyStack.value.push(path);
  historyIndex.value = historyStack.value.length - 1;
}

async function navigateToHistory(index: number) {
  historyIndex.value = index;
  const path = historyStack.value[index];
  if (path === "__thispc__") {
    viewingThisPC.value = true;
    viewingDrive.value = false;
    viewingFile.value = false;
    currentPath.value = "__thispc__";
    entries.value = [];
    loading.value = false;
  } else if (path === "__drive__") {
    viewingDrive.value = true;
    viewingThisPC.value = false;
    viewingFile.value = false;
    currentPath.value = "__drive__";
    loading.value = true;
    try {
      entries.value = await fetchUserRepos();
    } catch {
      error.value = "Failed to load repositories";
    } finally {
      loading.value = false;
    }
  } else if (path.startsWith("__file__:")) {
    const rest = path.slice(9);
    const sepIdx = rest.indexOf("::");
    const repo = rest.slice(0, sepIdx);
    const filePath = rest.slice(sepIdx + 2);
    currentRepo.value = repo;
    fileName.value = filePath.split("/").pop() ?? filePath;
    currentPath.value = filePath;
    viewingFile.value = true;
    viewingThisPC.value = false;
    viewingDrive.value = false;
    fileLoading.value = true;
    try {
      fileContent.value = await fetchFileContent(filePath, repo);
    } catch {
      fileContent.value = "Failed to load file content.";
    } finally {
      fileLoading.value = false;
    }
  } else {
    const sepIdx = path.indexOf("::");
    const repo = path.slice(0, sepIdx);
    const dirPath = path.slice(sepIdx + 2);
    currentRepo.value = repo;
    loading.value = true;
    error.value = "";
    viewingFile.value = false;
    viewingThisPC.value = false;
    viewingDrive.value = false;
    try {
      entries.value = await fetchContents(dirPath, repo);
      currentPath.value = dirPath;
    } catch {
      error.value = "Failed to load directory";
    } finally {
      loading.value = false;
    }
  }
}

function goBack() {
  if (canGoBack.value) navigateToHistory(historyIndex.value - 1);
}

function goForward() {
  if (canGoForward.value) navigateToHistory(historyIndex.value + 1);
}

function onMouseButton(e: MouseEvent) {
  if (e.button === 3) goBack();
  else if (e.button === 4) goForward();
}

const windowTitle = computed(() => viewingFile.value ? fileName.value : "File Explorer");

function showThisPC() {
  viewingThisPC.value = true;
  viewingDrive.value = false;
  viewingFile.value = false;
  currentPath.value = "__thispc__";
  entries.value = [];
  loading.value = false;
  pushHistory("__thispc__");
}

async function showDrive() {
  viewingDrive.value = true;
  viewingThisPC.value = false;
  viewingFile.value = false;
  currentPath.value = "__drive__";
  loading.value = true;
  error.value = "";
  pushHistory("__drive__");
  try {
    entries.value = await fetchUserRepos();
  } catch {
    error.value = "Failed to load repositories";
  } finally {
    loading.value = false;
  }
}

async function loadDir(path: string) {
  loading.value = true;
  error.value = "";
  viewingFile.value = false;
  viewingThisPC.value = false;
  viewingDrive.value = false;
  try {
    entries.value = await fetchContents(path, currentRepo.value);
    currentPath.value = path;
    pushHistory(`${currentRepo.value}::${path}`);
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
  viewingThisPC.value = false;
  currentPath.value = entry.path;
  pushHistory(`__file__:${currentRepo.value}::${entry.path}`);
  try {
    fileContent.value = await fetchFileContent(entry.path, currentRepo.value);
  } catch {
    fileContent.value = "Failed to load file content.";
  } finally {
    fileLoading.value = false;
  }
}

function onEntryClick(entry: GHEntry) {
  if (entry.path.startsWith("__repo__:")) {
    currentRepo.value = entry.path.slice(9);
    loadDir("");
  } else if (entry.type === "dir") {
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
  if (viewingThisPC.value) return;
  if (viewingDrive.value) {
    showThisPC();
    return;
  }
  if (currentPath.value === "") {
    showDrive();
    return;
  }
  const parts = currentPath.value.split("/");
  parts.pop();
  loadDir(parts.join("/"));
}

const canGoUp = computed(() => !viewingThisPC.value);

const pathSegments = ref<{ label: string; path: string }[]>([]);

watch(currentPath, (p) => {
  const segs: { label: string; path: string }[] = [
    { label: "This PC", path: "__thispc__" },
  ];
  if (p !== "__thispc__") {
    segs.push({ label: "Projects (D:)", path: "__drive__" });
    if (p !== "__drive__") {
      segs.push({ label: currentRepo.value.split("/").pop() ?? currentRepo.value, path: "" });
    }
    if (p && !p.startsWith("__")) {
      const parts = p.split("/");
      for (let i = 0; i < parts.length; i++) {
        segs.push({
          label: parts[i],
          path: parts.slice(0, i + 1).join("/"),
        });
      }
    }
  }
  pathSegments.value = segs;
}, { immediate: true });

const hasLoaded = ref(false);
watch(() => props.open, (isOpen) => {
  if (isOpen && !hasLoaded.value) {
    hasLoaded.value = true;
    loadDir("");
  }
});

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
  loaded: boolean;
  children?: NavNode[];
}

const navTree = ref<NavNode[]>([
  {
    label: "Quick access", icon: "pin", path: null, expanded: true, loaded: true,
    children: [
      { label: "jason-portfolio", icon: "folder", path: "", expanded: false, loaded: false },
    ],
  },
  {
    label: "This PC", icon: "pc", path: null, expanded: true, loaded: true,
    children: [
      { label: "Projects (D:)", icon: "drive", path: "__drive__", expanded: false, loaded: false },
    ],
  },
]);

async function loadNavChildren(node: NavNode) {
  if (node.path === null || node.loaded) return;
  try {
    const contents = await fetchContents(node.path, currentRepo.value);
    node.children = contents
      .filter((e) => e.type === "dir")
      .map((e) => ({
        label: e.name,
        icon: "folder" as const,
        path: e.path,
        expanded: false,
        loaded: false,
      }));
    node.loaded = true;
  } catch {
    node.children = [];
    node.loaded = true;
  }
}

async function loadDriveNavChildren(node: NavNode) {
  if (node.loaded) return;
  try {
    const repos = await fetchUserRepos();
    node.children = repos.map((r) => ({
      label: r.name,
      icon: "folder" as const,
      path: r.name === "jason-portfolio" ? "" : `__repo__:${r.name}`,
      expanded: false,
      loaded: false,
    }));
    node.loaded = true;
  } catch {
    node.children = [];
    node.loaded = true;
  }
}

async function onNavClick(node: NavNode) {
  if (node.icon === "pc") {
    showThisPC();
  } else if (node.path === "__drive__") {
    showDrive();
  } else if (node.path !== null) {
    loadDir(node.path);
  } else {
    node.expanded = !node.expanded;
  }
}

interface FlatNavItem {
  node: NavNode;
  depth: number;
}

function flattenNav(nodes: NavNode[], depth: number): FlatNavItem[] {
  const result: FlatNavItem[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.expanded && node.children) {
      result.push(...flattenNav(node.children, depth + 1));
    }
  }
  return result;
}

const flatNav = computed(() => flattenNav(navTree.value, 0));
</script>

<template>
  <WindowFrame
    :open="open"
    :title="windowTitle"
    :icon="fileExplorerIcon"
    @close="emit('close')"
    @dismiss-menus="emit('dismiss-menus')"
    @mouseup.stop="onMouseButton"
  >

      <!-- Navigation toolbar -->
      <div class="toolbar">
        <div class="nav-buttons">
          <button
            class="nav-btn"
            :disabled="!canGoBack"
            @click="goBack"
            aria-label="Back"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 2L4 8l6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            class="nav-btn"
            :disabled="!canGoForward"
            @click="goForward"
            aria-label="Forward"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            class="nav-btn"
            :disabled="!canGoUp"
            @click="goUp"
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
            <button class="path-segment" @click="seg.path === '__thispc__' ? showThisPC() : seg.path === '__drive__' ? showDrive() : loadDir(seg.path)">{{ seg.label }}</button>
          </template>
        </div>
      </div>

      <div class="body">
        <!-- Left navigation pane -->
        <div class="nav-pane">
          <button
            v-for="item in flatNav"
            :key="item.depth + ':' + item.node.label + ':' + (item.node.path ?? '')"
            class="nav-item"
            :style="{ paddingLeft: (4 + item.depth * 20) + 'px' }"
            @click="onNavClick(item.node)"
          >
            <span
              class="nav-arrow"
              :class="{ expanded: item.node.expanded, hidden: item.node.loaded && (!item.node.children || item.node.children.length === 0) }"
              @click.stop="item.node.expanded = !item.node.expanded; if (item.node.expanded && !item.node.loaded) { if (item.node.path === '__drive__') loadDriveNavChildren(item.node); else if (item.node.path !== null) loadNavChildren(item.node); }"
            >›</span>
            <svg v-if="item.node.icon === 'pin'" class="nav-icon" viewBox="0 0 16 16">
              <defs>
                <mask id="lines-mask">
                  <rect width="16" height="16" fill="white" />
                  <polygon points="9,1 11,6 16,6 12,9.5 13.5,15 9,11.5 4.5,15 6,9.5 2,6 7,6" fill="black" transform="matrix(1,0,-0.15,1,1.2,0)" />
                </mask>
              </defs>
              <polygon points="9,1 11,6 16,6 12,9.5 13.5,15 9,11.5 4.5,15 6,9.5 2,6 7,6" fill="#3b8eea" transform="matrix(1,0,-0.15,1,1.2,0)"/>
              <g mask="url(#lines-mask)" opacity="0.4">
                <line x1="0" y1="3.5" x2="8" y2="3.5" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0.5" y1="5" x2="8" y2="5" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0.5" y1="6.5" x2="5.5" y2="6.5" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0" y1="8" x2="5" y2="8" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0.5" y1="9.5" x2="4.5" y2="9.5" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0.5" y1="11" x2="4" y2="11" stroke="#3b8eea" stroke-width="0.7" />
                <line x1="0" y1="12.5" x2="3.5" y2="12.5" stroke="#3b8eea" stroke-width="0.7" />
              </g>
            </svg>
            <svg v-else-if="item.node.icon === 'pc'" class="nav-icon" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="9" rx="1" fill="#5ba4cf" stroke="#4a8ab5" stroke-width="0.5"/><rect x="5" y="11" width="6" height="1" fill="#888"/><rect x="4" y="12" width="8" height="1" rx="0.5" fill="#999"/></svg>
            <svg v-else-if="item.node.icon === 'drive'" class="nav-icon" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="1" fill="#bbb" stroke="#999" stroke-width="0.5"/><rect x="2" y="9" width="3" height="1.5" rx="0.5" fill="#6a6"/></svg>
            <img v-else :src="fileExplorerIcon" class="nav-icon" alt="" />
            <span class="nav-label">{{ item.node.label }}<svg v-if="item.node.label === 'jason-portfolio' && item.node.icon === 'folder'" class="nav-star" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.5 10,3.5 7,5.8 8,9.5 5,7.2 2,9.5 3,5.8 0,3.5 3.8,3.5" fill="#e8b500"/></svg></span>
          </button>
        </div>

        <!-- Main content -->
        <div class="content">
          <div v-if="loading" class="status-msg">Loading...</div>
          <div v-else-if="error" class="status-msg error">{{ error }}</div>
          <div v-else-if="viewingThisPC" class="this-pc-view">
            <button class="section-header">
              <span class="section-arrow">▾</span>
              Folders
            </button>
            <div class="folder-grid">
              <button
                v-for="repo in PINNED_REPOS"
                :key="repo.owner + '/' + repo.name"
                class="folder-tile"
                @click="currentRepo = repo.owner + '/' + repo.name; loadDir('')"
              >
                <img :src="fileExplorerIcon" class="folder-tile-icon" alt="" />
                <span class="folder-tile-label">{{ repo.name }}</span>
              </button>
            </div>
            <button class="section-header">
              <span class="section-arrow">▾</span>
              Devices and drives
            </button>
            <div class="drive-grid">
              <button class="drive-tile" @click="showDrive()">
                <svg class="drive-tile-icon" viewBox="0 0 48 48">
                  <rect x="2" y="10" width="44" height="28" rx="3" fill="#c0c0c0" stroke="#999" stroke-width="1" />
                  <rect x="5" y="30" width="10" height="5" rx="1.5" fill="#6a6" />
                  <rect x="6" y="14" width="36" height="12" rx="1" fill="#e8e8e8" />
                </svg>
                <div class="drive-tile-info">
                  <span class="drive-tile-label">Projects (D:)</span>
                  <div class="drive-bar">
                    <div class="drive-bar-fill"></div>
                  </div>
                  <span class="drive-tile-space">∞ GB free of ∞ GB</span>
                </div>
              </button>
            </div>
          </div>
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
                  <span class="entry-label">{{ entry.name }}<svg v-if="entry.path === '__repo__:jason-portfolio'" class="entry-star" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.5 10,3.5 7,5.8 8,9.5 5,7.2 2,9.5 3,5.8 0,3.5 3.8,3.5" fill="#e8b500"/></svg></span>
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
  </WindowFrame>
</template>

<style lang="css" scoped>
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
  cursor: pointer;
  padding: 2px 0;
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

.nav-star {
  width: 10px;
  height: 10px;
  vertical-align: -1px;
  margin-left: 3px;
}

.entry-star {
  width: 11px;
  height: 11px;
  vertical-align: -1px;
  margin-left: 4px;
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

/* This PC view */
.this-pc-view {
  padding: 8px 16px;
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  color: #0078d4;
  cursor: pointer;
  padding: 6px 0;
  width: 100%;
  text-align: left;
}

.section-header:hover {
  color: #005a9e;
}

.section-arrow {
  font-size: 10px;
  color: #666;
}

.folder-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.folder-tile {
  width: 130px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-tile:hover {
  background: #e8f0fe;
  border-color: #c0d0e8;
}

.folder-tile-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.folder-tile-label {
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drive-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.drive-tile {
  width: 260px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
}

.drive-tile:hover {
  background: #e8f0fe;
  border-color: #c0d0e8;
}

.drive-tile-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.drive-tile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.drive-tile-label {
  font-size: 12px;
  color: #333;
}

.drive-bar {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 1px;
  overflow: hidden;
}

.drive-bar-fill {
  width: 35%;
  height: 100%;
  background: #0078d4;
}

.drive-tile-space {
  font-size: 11px;
  color: #888;
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
