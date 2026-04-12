<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DesktopIcon from "./DesktopIcon.vue";
import Taskbar from "./Taskbar.vue";
import StartMenu from "./StartMenu.vue";
import DesktopContextMenu from "./DesktopContextMenu.vue";
import FileExplorer from "./file-explorer/FileExplorer.vue";
import ConversationWindow from "./ConversationWindow.vue";
import { useWindowManager } from "../../composables/useWindowManager";
import conversations from "../../data/conversations.json";
import fileExplorerIcon from "../../assets/file-explorer.svg";
import essaysIcon from "../../assets/essays.svg";
import thisPcIcon from "../../assets/this-pc.svg";
import workExpIcon from "../../assets/work-experience.svg";
import projectsIcon from "../../assets/projects.svg";

import wallpaper1 from "../../assets/wallpaper1.jpg";
import wallpaper2 from "../../assets/wallpaper2.jpg";
import wallpaper3 from "../../assets/wallpaper3.jpg";
import wallpaper4 from "../../assets/wallpaper4.jpg";
import wallpaper5 from "../../assets/wallpaper5.jpg";

const wallpapers = [wallpaper1, wallpaper2, wallpaper3, wallpaper4, wallpaper5];
const currentWallpaper = ref(0);
const nextWallpaper = ref(1);
const transitioning = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

function switchWallpaper(index: number) {
  if (transitioning.value) {
    currentWallpaper.value = nextWallpaper.value;
    transitioning.value = false;
    void (document.querySelector('.wallpaper-next') as HTMLElement | null)?.offsetWidth;
  }
  nextWallpaper.value = index;
  transitioning.value = true;
}

function advance() {
  switchWallpaper((currentWallpaper.value + 1) % wallpapers.length);
}

function goBack() {
  switchWallpaper((currentWallpaper.value - 1 + wallpapers.length) % wallpapers.length);
}

function onTransitionEnd() {
  currentWallpaper.value = nextWallpaper.value;
  transitioning.value = false;
}

onMounted(() => {
  timer = setInterval(advance, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const emit = defineEmits<{
  "print-resume": [];
}>();

interface ExplorerConfig {
  windowId: string;
  initialRepo?: string;
  initialFile?: string;
  initialDir?: string;
}

const wm = useWindowManager();
const explorers = ref<ExplorerConfig[]>([]);

function openNewExplorer(initialRepo?: string, initialFile?: string, initialDir?: string) {
  const title = initialFile ? initialFile.split("/").pop() ?? "File Explorer" : initialDir ? initialDir.split("/").pop() ?? "File Explorer" : "File Explorer";
  const id = wm.createWindow(title, fileExplorerIcon);
  explorers.value.push({ windowId: id, initialRepo, initialFile, initialDir });
}

function onExplorerClose(windowId: string) {
  wm.closeWindow(windowId);
  explorers.value = explorers.value.filter((e) => e.windowId !== windowId);
}

const workExpWindows = ref<string[]>([]);
const projectsWindows = ref<string[]>([]);

function openWorkExpWindow() {
  const id = wm.createWindow("Work Experience", workExpIcon);
  workExpWindows.value.push(id);
}

function onWorkExpClose(windowId: string) {
  wm.closeWindow(windowId);
  workExpWindows.value = workExpWindows.value.filter((id) => id !== windowId);
}

function openProjectsWindow() {
  const id = wm.createWindow("Projects", projectsIcon);
  projectsWindows.value.push(id);
}

function onProjectsClose(windowId: string) {
  wm.closeWindow(windowId);
  projectsWindows.value = projectsWindows.value.filter((id) => id !== windowId);
}

const startMenuOpen = ref(false);
const contextMenuOpen = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const desktopIcons = [
  { key: 'thisPc', label: 'This PC', icon: thisPcIcon, selected: ref(false), action: () => openNewExplorer() },
  { key: 'workExp', label: 'Work Experience', icon: workExpIcon, selected: ref(false), action: () => openWorkExpWindow() },
  { key: 'projects', label: 'Projects', icon: projectsIcon, selected: ref(false), action: () => openProjectsWindow() },
  { key: 'essays', label: 'Essays', icon: essaysIcon, selected: ref(false), action: () => openNewExplorer('u9g/jason-portfolio', undefined, 'src/data/essays') },
];

function onContextMenu(e: MouseEvent) {
  const el = e.target as HTMLElement;
  if (!el.closest('.win-desktop') || el.closest('.taskbar, .window-frame, .start-menu')) return;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuOpen.value = true;
  startMenuOpen.value = false;
}
</script>

<template>
  <div class="win-desktop" @click="desktopIcons.forEach(di => di.selected.value = false); startMenuOpen = false; contextMenuOpen = false" @contextmenu.prevent="onContextMenu">
    <div class="wallpaper-layer" :style="{ backgroundImage: `url(${wallpapers[currentWallpaper]})` }" />
    <div
      class="wallpaper-layer wallpaper-next"
      :class="{ 'wallpaper-visible': transitioning }"
      :style="{ backgroundImage: `url(${wallpapers[nextWallpaper]})` }"
      @transitionend="onTransitionEnd"
    />
    <div class="desktop-icons">
      <DesktopIcon
        v-for="di in desktopIcons"
        :key="di.key"
        :label="di.label"
        :icon="di.icon"
        :selected="di.selected.value"
        @click.stop="di.selected.value = !di.selected.value"
        @dblclick.stop="di.action(); di.selected.value = false"
      />
    </div>
    <FileExplorer
      v-for="cfg in explorers"
      :key="cfg.windowId"
      :window-id="cfg.windowId"
      :initial-repo="cfg.initialRepo"
      :initial-file="cfg.initialFile"
      :initial-dir="cfg.initialDir"
      @close="onExplorerClose(cfg.windowId)"
      @dismiss-menus="contextMenuOpen = false; startMenuOpen = false"
    />
    <ConversationWindow
      v-for="id in workExpWindows"
      :key="id"
      :window-id="id"
      window-title="Work Experience"
      :window-icon="workExpIcon"
      :items="conversations.jobs"
      @close="onWorkExpClose(id)"
      @dismiss-menus="contextMenuOpen = false; startMenuOpen = false"
    />
    <ConversationWindow
      v-for="id in projectsWindows"
      :key="id"
      :window-id="id"
      window-title="Projects"
      :window-icon="projectsIcon"
      :items="conversations.projects"
      @close="onProjectsClose(id)"
      @dismiss-menus="contextMenuOpen = false; startMenuOpen = false"
    />
    <DesktopContextMenu :open="contextMenuOpen" :x="contextMenuX" :y="contextMenuY" @close="contextMenuOpen = false" @next-background="advance" @prev-background="goBack" />
    <StartMenu :open="startMenuOpen" @print-resume="emit('print-resume')" />
    <Taskbar :start-menu-open="startMenuOpen" :open-windows="wm.openWindows.value" @toggle-start-menu="startMenuOpen = !startMenuOpen" @taskbar-click="wm.toggleTaskbarWindow" />
  </div>
</template>

<style lang="css" scoped>
.win-desktop {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.wallpaper-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.wallpaper-next {
  opacity: 0;
  transition: opacity 2s ease;
}

.wallpaper-visible {
  opacity: 1;
}

.desktop-icons {
  position: relative;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
