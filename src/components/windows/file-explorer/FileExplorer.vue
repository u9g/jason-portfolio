<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { fetchContents, fetchFileContent, fetchUserRepos, type GHEntry } from "../../../data/github-fs";
import { rawUrl } from "./helpers";
import MarkdownRender from "./MarkdownRender.vue";
import fileExplorerIcon from "../../../assets/file-explorer.svg";
import WindowFrame from "../WindowFrame.vue";
import { useWindowManager } from "../../../composables/useWindowManager";
import type { NavNode, FlatNavItem, PathSegment, HistoryEntry } from "./types";
import ExplorerToolbar from "./ExplorerToolbar.vue";
import NavigationPane from "./NavigationPane.vue";
import ThisPCView from "./ThisPCView.vue";
import DirectoryListing from "./DirectoryListing.vue";
import FileViewer from "./FileViewer.vue";
import Arrow from "../../shared/Arrow.vue";

const props = defineProps<{
  windowId: string;
  initialRepo?: string;
  initialFile?: string;
  initialDir?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { getWindow, focusWindow, minimizeWindow } = useWindowManager();
const defaultState = { open: false, minimized: false, focused: false, zIndex: 15, initialX: 100, initialY: 60 };
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
const searchQuery = ref("");
const readmeContent = ref("");
const readmeBaseUrl = computed(() => {
  const dir = currentPath.value ? currentPath.value + "/" : "";
  return rawUrl(dir, currentRepo.value);
});
const hasReadme = computed(() => readmeContent.value !== "");

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
  navigate(historyStack.value[index], false);
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

// Unified navigation
async function navigate(target: HistoryEntry, record = true) {
  error.value = "";
  readmeContent.value = "";
  searchQuery.value = "";
  viewMode.value = target.view;

  if (target.view === "thispc") {
    currentPath.value = "";
    entries.value = [];
    loading.value = false;
    if (record) pushHistory(target);
    return;
  }

  if (record) pushHistory(target);

  const isFile = target.view === "file";
  if (isFile) fileLoading.value = true;
  else loading.value = true;

  try {
    switch (target.view) {
      case "drive":
        currentPath.value = "";
        entries.value = await fetchUserRepos();
        break;
      case "directory":
        currentRepo.value = target.repo;
        currentPath.value = target.path;
        entries.value = await fetchContents(target.path, target.repo);
        {
          const readme = entries.value.find((e) => e.name.toLowerCase() === "readme.md");
          if (readme) {
            fetchFileContent(readme.path, target.repo)
              .then((content) => { readmeContent.value = content; })
              .catch(() => { /* ignore */ });
          }
        }
        break;
      case "file":
        currentRepo.value = target.repo;
        currentPath.value = target.path;
        fileName.value = target.name;
        fileContent.value = await fetchFileContent(target.path, target.repo);
        break;
    }
  } catch {
    if (target.view === "drive") error.value = "Failed to load repositories";
    else if (target.view === "directory") error.value = "Failed to load directory";
    else fileContent.value = "Failed to load file content.";
  } finally {
    if (isFile) fileLoading.value = false;
    else loading.value = false;
  }
}

const expandedImg = ref("");

function onContentClick(e: MouseEvent) {
  const img = (e.target as HTMLElement).closest("img") as HTMLImageElement | null;
  if (img) {
    e.preventDefault();
    expandedImg.value = img.src;
    return;
  }
  const anchor = (e.target as HTMLElement).closest("a[data-internal]") as HTMLAnchorElement | null;
  if (!anchor) return;
  e.preventDefault();
  const href = anchor.getAttribute("href") ?? "";
  const dir = viewMode.value === "file"
    ? currentPath.value.split("/").slice(0, -1).join("/")
    : currentPath.value;
  const resolved = dir ? dir + "/" + href : href;
  if (/\.\w+$/.test(href)) {
    navigate({ view: "file", repo: currentRepo.value, path: resolved, name: href.split("/").pop() ?? href });
  } else {
    navigate({ view: "directory", repo: currentRepo.value, path: resolved });
  }
}

function onEntryClick(entry: GHEntry) {
  if (entry.path.startsWith("__repo__:")) {
    const repo = entry.path.slice(9);
    navigate({ view: "directory", repo, path: "" });
  } else if (entry.type === "dir") {
    navigate({ view: "directory", repo: currentRepo.value, path: entry.path });
  } else {
    navigate({ view: "file", repo: currentRepo.value, path: entry.path, name: entry.name });
  }
}

function goUp() {
  if (viewMode.value === "thispc") return;
  if (viewMode.value === "drive") return navigate({ view: "thispc" });
  const parentPath = currentPath.value.split("/").slice(0, -1).join("/");
  if (viewMode.value === "file") return navigate({ view: "directory", repo: currentRepo.value, path: parentPath });
  if (currentPath.value === "") return navigate({ view: "drive" });
  navigate({ view: "directory", repo: currentRepo.value, path: parentPath });
}

const canGoUp = computed(() => viewMode.value !== "thispc");

function onNavigateSegment(path: string) {
  if (path === "__thispc__") navigate({ view: "thispc" });
  else if (path === "__drive__") navigate({ view: "drive" });
  else navigate({ view: "directory", repo: currentRepo.value, path });
}

function onOpenRepo(owner: string, name: string) {
  navigate({ view: "directory", repo: owner + "/" + name, path: "" });
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
    const repo = props.initialRepo ?? currentRepo.value;
    if (props.initialFile) {
      navigate({ view: "file", repo, path: props.initialFile, name: props.initialFile.split("/").pop() ?? props.initialFile });
    } else if (props.initialDir) {
      navigate({ view: "directory", repo, path: props.initialDir });
    } else if (props.initialRepo) {
      navigate({ view: "directory", repo, path: "" });
    } else {
      navigate({ view: "thispc" });
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
    navigate({ view: "thispc" });
  } else if (node.path === "__drive__") {
    navigate({ view: "drive" });
  } else if (node.path !== null) {
    navigate({ view: "directory", repo: currentRepo.value, path: node.path });
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

const filteredEntries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return entries.value;
  return entries.value.filter((e) => e.name.toLowerCase().includes(q));
});

const githubUrl = computed(() => {
  const repo = currentRepo.value.includes("/") ? currentRepo.value : `u9g/${currentRepo.value}`;
  const base = `https://github.com/${repo}`;
  if (viewMode.value === "drive" || viewMode.value === "thispc") return "";
  if (viewMode.value === "file") return `${base}/blob/HEAD/${currentPath.value}`;
  if (currentPath.value) return `${base}/tree/HEAD/${currentPath.value}`;
  return base;
});
</script>

<template>
  <WindowFrame
    :open="wState.open"
    :minimized="wState.minimized"
    :focused="wState.focused"
    :z-index="wState.zIndex"
    :initial-x="wState.initialX"
    :initial-y="wState.initialY"
    :title="windowTitle"
    :icon="windowIcon"
    @close="emit('close')"
    @minimize="minimizeWindow(windowId)"
    @focus="focusWindow(windowId)"
    @mouseup="onMouseButton"
  >
    <div v-if="viewMode === 'drive'" class="info-bar">
      <svg class="info-bar-icon" viewBox="0 0 16 16" width="14" height="14">
        <circle cx="8" cy="8" r="7" fill="#fff" stroke="#2e7d32" stroke-width="1.5"/>
        <text x="8" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#2e7d32">i</text>
      </svg><span>This is a list of Jason's Github Repositories, equivalent to <a href="https://github.com/u9g?tab=repositories" target="_blank" class="info-bar-link">github.com/u9g <Arrow /></a></span>
    </div>

    <ExplorerToolbar
      :can-go-back="canGoBack"
      :can-go-forward="canGoForward"
      :can-go-up="canGoUp"
      :path-segments="pathSegments"
      :github-url="githubUrl"
      :show-search="viewMode !== 'thispc' && viewMode !== 'file'"
      :search-query="searchQuery"
      @back="goBack"
      @forward="goForward"
      @up="goUp"
      @navigate-segment="onNavigateSegment"
      @update:search-query="searchQuery = $event"
    />

    <div class="body">
      <NavigationPane
        :flat-nav="flatNav"
        @nav-click="onNavClick"
        @toggle-expand="onToggleExpand"
      />

      <div class="content" @click="onContentClick">
        <div v-if="loading" class="status-msg">Loading...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>
        <ThisPCView
          v-else-if="viewMode === 'thispc'"
          @open-repo="onOpenRepo"
          @show-drive="navigate({ view: 'drive' })"
        />
        <FileViewer
          v-else-if="viewMode === 'file'"
          ref="fileViewerRef"
          :file-name="fileName"
          :file-path="currentPath"
          :file-content="fileContent"
          :file-loading="fileLoading"
          :current-repo="currentRepo"
        />
        <div v-else-if="hasReadme" class="dir-readme-split">
          <div class="dir-readme-listing">
            <DirectoryListing
              :entries="filteredEntries"
              :current-repo="currentRepo"
              :is-drive="viewMode === 'drive'"
              @entry-click="onEntryClick"
            />
          </div>
          <div class="dir-readme-pane">
            <MarkdownRender :source="readmeContent" :base-url="readmeBaseUrl" />
          </div>
        </div>
        <DirectoryListing
          v-else
          :entries="filteredEntries"
          :current-repo="currentRepo"
          :is-drive="viewMode === 'drive'"
          @entry-click="onEntryClick"
        />
      </div>
    </div>

    <div class="status-bar">
      <span v-if="viewMode !== 'file'">{{ filteredEntries.length }} items</span>
      <span v-else>{{ fileName }}</span>
    </div>

    <div v-if="expandedImg" class="img-lightbox" @click="expandedImg = ''">
      <img :src="expandedImg" class="img-lightbox-img" />
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

.info-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #dff6dd;
  border-bottom: 1px solid #b7dfb9;
  color: #1b5e20;
  font-size: 12px;
  flex-shrink: 0;
}

.info-bar-icon {
  flex-shrink: 0;
}

.info-bar-link {
  color: #1b5e20;
  text-decoration: none;
  border-bottom: 1px solid #1b5e20;
}

.info-bar-link:hover {
  color: #0d3c11;
  border-bottom-color: #0d3c11;
}

.dir-readme-split {
  flex: 1;
  display: flex;
  min-height: 0;
}

.dir-readme-listing {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-width: 0;
}

.dir-readme-pane {
  flex: 1;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
  background: #fff;
  padding: 12px;
  min-width: 0;
}


.img-lightbox {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.img-lightbox-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
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
