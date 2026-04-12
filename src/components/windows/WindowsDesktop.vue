<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DesktopIcon from "./DesktopIcon.vue";
import Taskbar from "./Taskbar.vue";
import wallpaper1 from "../../assets/wallpaper1.jpg";
import wallpaper2 from "../../assets/wallpaper2.jpg";
import wallpaper3 from "../../assets/wallpaper3.jpg";
import wallpaper4 from "../../assets/wallpaper4.jpg";
import wallpaper5 from "../../assets/wallpaper5.jpg";

const wallpapers = [wallpaper1, wallpaper2, wallpaper3, wallpaper4, wallpaper5];
const currentWallpaper = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    currentWallpaper.value = (currentWallpaper.value + 1) % wallpapers.length;
  }, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const iconSelected = ref(false);

function toggleIcon() {
  iconSelected.value = !iconSelected.value;
}
</script>

<template>
  <div class="win-desktop" :style="{ backgroundImage: `url(${wallpapers[currentWallpaper]})` }" @click="iconSelected = false">
    <div class="desktop-icons">
      <DesktopIcon
        label="File Explorer"
        :selected="iconSelected"
        @click.stop="toggleIcon"
      />
    </div>
    <Taskbar />
  </div>
</template>

<style lang="css" scoped>
.win-desktop {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

.desktop-icons {
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
