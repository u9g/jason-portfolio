<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DesktopIcon from "./DesktopIcon.vue";
import Taskbar from "./Taskbar.vue";
import StartMenu from "./StartMenu.vue";
import DesktopContextMenu from "./DesktopContextMenu.vue";
import FileExplorer from "./FileExplorer.vue";
import { useWindowManager } from "../../composables/useWindowManager";
import fileExplorerIcon from "../../assets/file-explorer.svg";
import folderFullIcon from "../../assets/folder-full.png";
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

const iconSelected = ref(false);
const faviconSelected = ref(false);
const essaysSelected = ref(false);
const startMenuOpen = ref(false);
const contextMenuOpen = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

function toggleIcon() {
  iconSelected.value = !iconSelected.value;
}

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
  <div class="win-desktop" @click="iconSelected = false; faviconSelected = false; essaysSelected = false; startMenuOpen = false; contextMenuOpen = false" @contextmenu.prevent="onContextMenu">
    <div class="wallpaper-layer" :style="{ backgroundImage: `url(${wallpapers[currentWallpaper]})` }" />
    <div
      class="wallpaper-layer wallpaper-next"
      :class="{ 'wallpaper-visible': transitioning }"
      :style="{ backgroundImage: `url(${wallpapers[nextWallpaper]})` }"
      @transitionend="onTransitionEnd"
    />
    <div class="desktop-icons">
      <DesktopIcon
        label="File Explorer"
        :selected="iconSelected"
        @click.stop="toggleIcon"
        @dblclick.stop="openNewExplorer(); iconSelected = false"
      />
      <DesktopIcon
        label="favicon.svg"
        icon="/favicon.svg"
        class="favicon-icon"
        :selected="faviconSelected"
        @click.stop="faviconSelected = !faviconSelected"
        @dblclick.stop="openNewExplorer('u9g/jason-portfolio', 'public/favicon.svg'); faviconSelected = false"
      />
      <DesktopIcon
        label="Essays"
        :icon="folderFullIcon"
        :selected="essaysSelected"
        @click.stop="essaysSelected = !essaysSelected"
        @dblclick.stop="openNewExplorer('u9g/jason-portfolio', undefined, 'src/data/essays'); essaysSelected = false"
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
