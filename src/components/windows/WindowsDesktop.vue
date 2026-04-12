<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DesktopIcon from "./DesktopIcon.vue";
import Taskbar from "./Taskbar.vue";
import StartMenu from "./StartMenu.vue";
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

function advance() {
  nextWallpaper.value = (currentWallpaper.value + 1) % wallpapers.length;
  transitioning.value = true;
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

const iconSelected = ref(false);
const startMenuOpen = ref(false);

function toggleIcon() {
  iconSelected.value = !iconSelected.value;
}
</script>

<template>
  <div class="win-desktop" @click="iconSelected = false; startMenuOpen = false">
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
      />
    </div>
    <StartMenu :open="startMenuOpen" @print-resume="emit('print-resume')" />
    <Taskbar :start-menu-open="startMenuOpen" @toggle-start-menu="startMenuOpen = !startMenuOpen" />
  </div>
</template>

<style lang="css" scoped>
.win-desktop {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
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
