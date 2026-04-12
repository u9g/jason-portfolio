<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { fetchContents, fetchFileContent, fetchUserRepos, type GHEntry } from "../../../data/github-fs";
import fileExplorerIcon from "../../../assets/file-explorer.svg";
import WindowFrame from "../WindowFrame.vue";
import { useWindowManager } from "../../../composables/useWindowManager";
import type { NavNode, FlatNavItem, PathSegment, HistoryEntry } from "./types";
import ExplorerToolbar from "./ExplorerToolbar.vue";
import NavigationPane from "./NavigationPane.vue";
import ThisPCView from "./ThisPCView.vue";
import DirectoryListing from "./DirectoryListing.vue";
import FileViewer from "./FileViewer.vue";

const props = defineProps<{
  windowId: string;
  initialRepo?: string;
  initialFile?: string;
  initialDir?: string;
}>();

const emit = defineEmits<{
  close: [];
  "dismiss-menus": [];
}>();

const { getWindow, focusWindow, minimizeWindow } = useWindowManager();
const defaultState = { open: false, minimized: false, focused: false, zIndex: 15 };
const wState = computed(() => getWindow(props.windowId) ?? defaultState);

const currentPath = ref("");
const entries = ref<GHEntry[]>([]);
const loading = ref(false);
const error = ref("");

type ViewMode = "thispc" | "drive" | "directory" | "file";
const viewMode = ref<ViewMode>("directory");
const fileContent = ref("");
const fileName = ref("");
const fileLoading = ref(false);
const currentRepo = ref("jason-portfolio");

// History navigation
const historyStack = ref<HistoryEntry[]>([]);
const historyIndex = ref(-1);
const canGoBack = computed(() => historyIndex.value > 0);
const canGoForward = computed(() => historyIndex.value < historyStack.value.length - 1);

function pushHistory(entry: HistoryEntry) {
  historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
  historyStack.value.push(entry);
  historyIndex.value = historyStack.value.length - 1;
}

async function navigateToHistory(index: number) {
  historyIndex.value = index;
  const entry = historyStack.value[index];
  switch (entry.view) {
    case "thispc": return showThisPC(false);
    case "drive": return showDrive(false);
    case "directory":
      currentRepo.value = entry.repo;
      return loadDir(entry.path, false);
    case "file":
      currentRepo.value = entry.repo;
      return openFile({ name: entry.name, path: entry.path, type: "file", size: 0 }, false);
  }
}

function goBack() {
  if (canGoBack.value) navigateToHistory(historyIndex.value - 1);
}

function goForward() {
  if (canGoForward.value) navigateToHistory(historyIndex.value + 1);
}

function onMouseButton(e: MouseEvent) {
  if (e.button === 3) { e.stopPropagation(); goBack(); }
  else if (e.button === 4) { e.stopPropagation(); goForward(); }
}

// Window title and icon
const windowTitle = computed(() => viewMode.value === "file" ? fileName.value : "File Explorer");

const fileViewerRef = ref<InstanceType<typeof FileViewer> | null>(null);
const windowIcon = computed(() => {
  const viewer = fileViewerRef.value;
  if (viewer?.isSvg && viewer.svgDataUrl) return viewer.svgDataUrl;
  return fileExplorerIcon;
});

watch(windowTitle, (t) => {
  const w = getWindow(props.windowId);
  if (w) w.title = t;
}, { immediate: true });

watch(windowIcon, (i) => {
  const w = getWindow(props.windowId);
  if (w) w.icon = i;
}, { immediate: true });

// Navigation actions
function showThisPC(record = true) {
  viewMode.value = "thispc";
  currentPath.value = "";
  entries.value = [];
  loading.value = false;
  if (record) pushHistory({ view: "thispc" });
}

async function showDrive(record = true) {
  viewMode.value = "drive";
  currentPath.value = "";
  loading.value = true;
  error.value = "";
  if (record) pushHistory({ view: "drive" });
  try {
    entries.value = await fetchUserRepos();
  } catch {
    error.value = "Failed to load repositories";
  } finally {
    loading.value = false;
  }
}

async function loadDir(path: string, record = true) {
  loading.value = true;
  error.value = "";
  viewMode.value = "directory";
  try {
    entries.value = await fetchContents(path, currentRepo.value);
    currentPath.value = path;
    if (record) pushHistory({ view: "directory", repo: currentRepo.value, path });
  } catch {
    error.value = "Failed to load directory";
  } finally {
    loading.value = false;
  }
}

async function openFile(entry: GHEntry, record = true) {
  fileLoading.value = true;
  fileName.value = entry.name;
  viewMode.value = "file";
  currentPath.value = entry.path;
  if (record) pushHistory({ view: "file", repo: currentRepo.value, path: entry.path, name: entry.name });
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
  if (viewMode.value === "file") {
    viewMode.value = "directory";
    return;
  }
  if (viewMode.value === "thispc") return;
  if (viewMode.value === "drive") {
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

const canGoUp = computed(() => viewMode.value !== "thispc");

function onNavigateSegment(path: string) {
  if (path === "__thispc__") showThisPC();
  else if (path === "__drive__") showDrive();
  else loadDir(path);
}

function onOpenRepo(owner: string, name: string) {
  currentRepo.value = owner + "/" + name;
  loadDir("");
}

// Path segments
const pathSegments = computed<PathSegment[]>(() => {
  const segs: PathSegment[] = [
    { label: "This PC", path: "__thispc__" },
  ];
  if (viewMode.value === "thispc") return segs;
  segs.push({ label: "Jason's Github (D:)", path: "__drive__" });
  if (viewMode.value === "drive") return segs;
  segs.push({ label: currentRepo.value.split("/").pop() ?? currentRepo.value, path: "" });
  if (currentPath.value) {
    const parts = currentPath.value.split("/");
    for (let i = 0; i < parts.length; i++) {
      segs.push({
        label: parts[i],
        path: parts.slice(0, i + 1).join("/"),
      });
    }
  }
  return segs;
});

// Initial load
const hasLoaded = ref(false);
watch(() => wState.value.open, (isOpen) => {
  if (isOpen && !hasLoaded.value) {
    hasLoaded.value = true;
    if (props.initialRepo) currentRepo.value = props.initialRepo;
    if (props.initialFile) {
      openFile({ name: props.initialFile.split("/").pop() ?? props.initialFile, path: props.initialFile, type: "file", size: 0 });
    } else if (props.initialDir) {
      loadDir(props.initialDir);
    } else if (props.initialRepo) {
      loadDir("");
    } else {
      showThisPC();
    }
  }
}, { immediate: true });

// Navigation tree
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
      { label: "Jason's Github (D:)", icon: "drive", path: "__drive__", expanded: false, loaded: false },
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

async function onToggleExpand(node: NavNode) {
  node.expanded = !node.expanded;
  if (node.expanded && !node.loaded) {
    if (node.path === "__drive__") loadDriveNavChildren(node);
    else if (node.path !== null) loadNavChildren(node);
  }
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
    :open="wState.open"
    :minimized="wState.minimized"
    :focused="wState.focused"
    :z-index="wState.zIndex"
    :title="windowTitle"
    :icon="windowIcon"
    @close="emit('close')"
    @minimize="minimizeWindow(windowId)"
    @focus="focusWindow(windowId)"
    @dismiss-menus="emit('dismiss-menus')"
    @mouseup="onMouseButton"
  >
    <ExplorerToolbar
      :can-go-back="canGoBack"
      :can-go-forward="canGoForward"
      :can-go-up="canGoUp"
      :path-segments="pathSegments"
      @back="goBack"
      @forward="goForward"
      @up="goUp"
      @navigate-segment="onNavigateSegment"
    />

    <div class="body">
      <NavigationPane
        :flat-nav="flatNav"
        @nav-click="onNavClick"
        @toggle-expand="onToggleExpand"
      />

      <div class="content">
        <div v-if="loading" class="status-msg">Loading...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>
        <ThisPCView
          v-else-if="viewMode === 'thispc'"
          @open-repo="onOpenRepo"
          @show-drive="showDrive"
        />
        <FileViewer
          v-else-if="viewMode === 'file'"
          ref="fileViewerRef"
          :file-name="fileName"
          :file-content="fileContent"
          :file-loading="fileLoading"
          :current-repo="currentRepo"
        />
        <DirectoryListing
          v-else
          :entries="entries"
          :current-repo="currentRepo"
          @entry-click="onEntryClick"
        />
      </div>
    </div>

    <div class="status-bar">
      <span v-if="viewMode !== 'file'">{{ entries.length }} items</span>
      <span v-else>{{ fileName }}</span>
    </div>
  </WindowFrame>
</template>

<style lang="css" scoped>
.body {
  display: flex;
  flex: 1;
  min-height: 0;
}

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
