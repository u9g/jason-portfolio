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

function useConversationWindows(title: string, icon: string) {
  const ids = ref<string[]>([]);
  const open = () => ids.value.push(wm.createWindow(title, icon));
  const close = (id: string) => {
    wm.closeWindow(id);
    ids.value = ids.value.filter(w => w !== id);
  };
  return { ids, open, close };
}

const workExp = useConversationWindows("Work Experience", workExpIcon);
const projects = useConversationWindows("Projects", projectsIcon);

const selectedIcon = ref<string | null>(null);
const startMenuOpen = ref(false);
const contextMenuOpen = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

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
  <div class="win-desktop" @click="selectedIcon = null; startMenuOpen = false; contextMenuOpen = false" @contextmenu.prevent="onContextMenu">
    <div class="wallpaper-layer" :style="{ backgroundImage: `url(${wallpapers[currentWallpaper]})` }" />
    <div
      class="wallpaper-layer wallpaper-next"
      :class="{ 'wallpaper-visible': transitioning }"
      :style="{ backgroundImage: `url(${wallpapers[nextWallpaper]})` }"
      @transitionend="onTransitionEnd"
    />
    <div class="desktop-icons">
      <DesktopIcon
        label="This PC"
        :icon="thisPcIcon"
        :selected="selectedIcon === 'thisPc'"
        @click.stop="selectedIcon = selectedIcon === 'thisPc' ? null : 'thisPc'"
        @dblclick.stop="openNewExplorer(); selectedIcon = null"
      />
      <DesktopIcon
        label="Work Experience"
        :icon="workExpIcon"
        :selected="selectedIcon === 'workExp'"
        @click.stop="selectedIcon = selectedIcon === 'workExp' ? null : 'workExp'"
        @dblclick.stop="workExp.open(); selectedIcon = null"
      />
      <DesktopIcon
        label="Projects"
        :icon="projectsIcon"
        :selected="selectedIcon === 'projects'"
        @click.stop="selectedIcon = selectedIcon === 'projects' ? null : 'projects'"
        @dblclick.stop="projects.open(); selectedIcon = null"
      />
      <DesktopIcon
        label="Essays"
        :icon="essaysIcon"
        :selected="selectedIcon === 'essays'"
        @click.stop="selectedIcon = selectedIcon === 'essays' ? null : 'essays'"
        @dblclick.stop="openNewExplorer('u9g/jason-portfolio', undefined, 'src/data/essays'); selectedIcon = null"
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
      v-for="id in workExp.ids.value"
      :key="id"
      :window-id="id"
      window-title="Work Experience"
      :window-icon="workExpIcon"
      :items="conversations.jobs"
      @close="workExp.close(id)"
      @dismiss-menus="contextMenuOpen = false; startMenuOpen = false"
    />
    <ConversationWindow
      v-for="id in projects.ids.value"
      :key="id"
      :window-id="id"
      window-title="Projects"
      :window-icon="projectsIcon"
      :items="conversations.projects"
      @close="projects.close(id)"
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
