<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  open: boolean;
  title: string;
  icon?: string;
}>();

const emit = defineEmits<{
  close: [];
  "dismiss-menus": [];
}>();

const maximized = ref(false);
const posX = ref(100);
const posY = ref(60);
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let preMaxPos = { x: 0, y: 0 };

function onTitleBarMouseDown(e: MouseEvent) {
  if (maximized.value) return;
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

function toggleMaximize() {
  if (maximized.value) {
    maximized.value = false;
    posX.value = preMaxPos.x;
    posY.value = preMaxPos.y;
  } else {
    preMaxPos = { x: posX.value, y: posY.value };
    maximized.value = true;
    posX.value = 0;
    posY.value = 0;
  }
}

function onTitleBarDblClick() {
  toggleMaximize();
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <Transition name="win-frame">
    <div
      v-if="open"
      class="window-frame"
      :class="{ maximized }"
      :style="maximized ? {} : { left: posX + 'px', top: posY + 'px' }"
      @click.stop="emit('dismiss-menus')"
      @contextmenu.stop.prevent
    >
      <div class="title-bar" @mousedown="onTitleBarMouseDown" @dblclick="onTitleBarDblClick">
        <img v-if="icon" :src="icon" class="title-icon" alt="" />
        <span class="title-text">{{ title }}</span>
        <div class="title-buttons">
          <button class="title-btn" aria-label="Minimize">
            <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="6" x2="11" y2="6" stroke="#333" stroke-width="1" /></svg>
          </button>
          <button class="title-btn" aria-label="Maximize" @click.stop="toggleMaximize">
            <svg v-if="!maximized" viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="#333" stroke-width="1" /></svg>
            <svg v-else viewBox="0 0 12 12" width="10" height="10">
              <rect x="3" y="0.5" width="8.5" height="8.5" fill="none" stroke="#333" stroke-width="1" />
              <rect x="0.5" y="3" width="8.5" height="8.5" fill="#fff" stroke="#333" stroke-width="1" />
            </svg>
          </button>
          <button class="title-btn close" aria-label="Close" @click.stop="emit('close')">
            <svg viewBox="0 0 12 12" width="10" height="10">
              <line x1="1" y1="1" x2="11" y2="11" stroke="#333" stroke-width="1.2" />
              <line x1="11" y1="1" x2="1" y2="11" stroke="#333" stroke-width="1.2" />
            </svg>
          </button>
        </div>
      </div>
      <div class="window-content">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
.window-frame {
  position: absolute;
  width: 750px;
  height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #888;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  z-index: 15;
  font-family: "Segoe UI", -apple-system, sans-serif;
  font-size: 12px;
}

.window-frame.maximized {
  width: 100vw;
  height: calc(100vh - 40px);
  top: 0;
  left: 0;
  border: none;
  box-shadow: none;
}

.win-frame-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.win-frame-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.win-frame-enter-from,
.win-frame-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

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

.window-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
