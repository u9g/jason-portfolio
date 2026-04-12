<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import startIcon from "../../assets/windows-start.svg";
import type { TaskbarEntry } from "../../composables/useWindowManager";

defineProps<{
  startMenuOpen: boolean;
  openWindows: TaskbarEntry[];
}>();

const emit = defineEmits<{
  "toggle-start-menu": [];
  "taskbar-click": [id: string];
}>();

const time = ref("");
const date = ref("");
let timer: ReturnType<typeof setInterval> | undefined;

function updateClock() {
  const now = new Date();
  time.value = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  date.value = now.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="taskbar">
    <button class="start-button" :class="{ active: startMenuOpen }" aria-label="Start" @click.stop="emit('toggle-start-menu')">
      <img :src="startIcon" alt="" class="start-icon" />
    </button>
    <div class="taskbar-windows">
      <button
        v-for="win in openWindows"
        :key="win.id"
        class="taskbar-window-btn"
        :class="{ focused: win.focused }"
        @click.stop="emit('taskbar-click', win.id)"
      >
        <img :src="win.icon" alt="" class="taskbar-window-icon" />
        <span class="taskbar-window-title">{{ win.title }}</span>
      </button>
    </div>
    <div class="taskbar-spacer"></div>
    <div class="system-tray">
      <div class="clock">
        <span class="clock-time">{{ time }}</span>
        <span class="clock-date">{{ date }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(0, 40, 80, 0.3);
  backdrop-filter: blur(30px) saturate(1.5);
  display: flex;
  align-items: center;
  z-index: 10;
  font-family: "Segoe UI", -apple-system, sans-serif;
}

.start-button {
  width: 48px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-icon {
  width: 16px;
  height: 16px;
}

.start-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.start-button.active {
  background: rgba(255, 255, 255, 0.2);
}

.start-button:hover .start-icon {
  filter: brightness(0) saturate(100%) invert(40%) sepia(90%) saturate(1000%) hue-rotate(190deg) brightness(1.1);
}

.taskbar-windows {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 2px;
  padding: 0 4px;
}

.taskbar-window-btn {
  height: 34px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 12px;
  font-family: "Segoe UI", -apple-system, sans-serif;
}

.taskbar-window-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.taskbar-window-btn.focused {
  background: rgba(255, 255, 255, 0.15);
  border-bottom-color: #4cc2ff;
}

.taskbar-window-icon {
  width: 16px;
  height: 16px;
}

.taskbar-window-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.taskbar-spacer {
  flex: 1;
}

.system-tray {
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
}

.system-tray:hover {
  background: rgba(255, 255, 255, 0.05);
}

.clock {
  text-align: right;
  line-height: 1.3;
}

.clock-time,
.clock-date {
  display: block;
  font-size: 12px;
  color: white;
}
</style>
