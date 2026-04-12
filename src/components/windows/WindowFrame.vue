<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

type SnapZone = "max" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;
type MaxState = "max" | null;

const props = defineProps<{
  open: boolean;
  title: string;
  icon?: string;
  zIndex?: number;
  focused?: boolean;
  minimized?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  minimize: [];
  focus: [];
  mouseup: [e: MouseEvent];
}>();

const snap = ref<MaxState>(null);
const snapPreview = ref<SnapZone>(null);
const posX = ref(100);
const posY = ref(60);
const winW = ref(750);
const winH = ref(500);
let dragPending = false;
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;
let preSnapPos = { x: 0, y: 0 };
const DRAG_THRESHOLD = 4;
const EDGE = 8;
const CORNER = 50;
const TASKBAR = 40;
const MIN_W = 300;
const MIN_H = 200;

type ResizeDir = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
let resizing = false;
let resizeDir: ResizeDir = "right";
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartW = 0;
let resizeStartH = 0;
let resizeStartPosX = 0;
let resizeStartPosY = 0;

function detectSnapZone(x: number, y: number): SnapZone {
  const w = window.innerWidth;
  const h = window.innerHeight - TASKBAR;
  const atLeft = x <= EDGE;
  const atRight = x >= w - EDGE;
  const atTop = y <= EDGE;
  const atBottom = y >= h - EDGE;
  const nearTop = y < CORNER;
  const nearBottom = y > h - CORNER;
  const nearLeft = x < CORNER;
  const nearRight = x > w - CORNER;

  if (atTop && nearLeft) return "top-left";
  if (atTop && nearRight) return "top-right";
  if (atLeft && nearTop) return "top-left";
  if (atRight && nearTop) return "top-right";
  if (atLeft && nearBottom) return "bottom-left";
  if (atRight && nearBottom) return "bottom-right";
  if (atBottom && nearLeft) return "bottom-left";
  if (atBottom && nearRight) return "bottom-right";
  if (atTop) return "max";
  if (atLeft) return "left";
  if (atRight) return "right";
  return null;
}

const snapStyle = computed(() => {
  if (snap.value === "max") return { left: "0", top: "0", width: "100vw", height: "calc(100vh - 40px)" };
  return { left: posX.value + "px", top: posY.value + "px", width: winW.value + "px", height: winH.value + "px" };
});

const previewStyle = computed(() => {
  if (!snapPreview.value) return null;
  const h = "calc(100vh - 40px)";
  const halfH = "calc((100vh - 40px) / 2)";
  switch (snapPreview.value) {
    case "max": return { left: "0", top: "0", width: "100vw", height: h };
    case "left": return { left: "0", top: "0", width: "50vw", height: h };
    case "right": return { left: "50vw", top: "0", width: "50vw", height: h };
    case "top-left": return { left: "0", top: "0", width: "50vw", height: halfH };
    case "top-right": return { left: "50vw", top: "0", width: "50vw", height: halfH };
    case "bottom-left": return { left: "0", top: halfH, width: "50vw", height: halfH };
    case "bottom-right": return { left: "50vw", top: halfH, width: "50vw", height: halfH };
  }
});

function applySnapZone(zone: SnapZone) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - TASKBAR;
  switch (zone) {
    case "left":         posX.value = 0;      posY.value = 0;      winW.value = vw / 2; winH.value = vh; break;
    case "right":        posX.value = vw / 2; posY.value = 0;      winW.value = vw / 2; winH.value = vh; break;
    case "top-left":     posX.value = 0;      posY.value = 0;      winW.value = vw / 2; winH.value = vh / 2; break;
    case "top-right":    posX.value = vw / 2; posY.value = 0;      winW.value = vw / 2; winH.value = vh / 2; break;
    case "bottom-left":  posX.value = 0;      posY.value = vh / 2; winW.value = vw / 2; winH.value = vh / 2; break;
    case "bottom-right": posX.value = vw / 2; posY.value = vh / 2; winW.value = vw / 2; winH.value = vh / 2; break;
  }
}

function onTitleBarMouseDown(e: MouseEvent) {
  dragPending = true;
  dragging = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  if (!snap.value) {
    dragOffsetX = e.clientX - posX.value;
    dragOffsetY = e.clientY - posY.value;
  }
}

function onResizeMouseDown(dir: ResizeDir, e: MouseEvent) {
  e.preventDefault();
  resizing = true;
  resizeDir = dir;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = winW.value;
  resizeStartH = winH.value;
  resizeStartPosX = posX.value;
  resizeStartPosY = posY.value;
}

function onMouseMove(e: MouseEvent) {
  if (resizing) {
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    const dir = resizeDir;
    if (dir.includes("right")) {
      winW.value = Math.max(MIN_W, resizeStartW + dx);
    }
    if (dir.includes("left")) {
      const newW = Math.max(MIN_W, resizeStartW - dx);
      posX.value = resizeStartPosX + resizeStartW - newW;
      winW.value = newW;
    }
    if (dir.includes("bottom")) {
      winH.value = Math.max(MIN_H, resizeStartH + dy);
    }
    if (dir === "top" || dir === "top-left" || dir === "top-right") {
      const newH = Math.max(MIN_H, resizeStartH - dy);
      posY.value = resizeStartPosY + resizeStartH - newH;
      winH.value = newH;
    }
    return;
  }
  if (!dragPending && !dragging) return;
  if (dragPending && !dragging) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    dragging = true;
    dragPending = false;
    if (snap.value === "max") {
      // Restore from maximized: place window so cursor is proportionally on the title bar
      const restoredWidth = winW.value;
      const fractionX = dragStartX / window.innerWidth;
      posX.value = e.clientX - fractionX * restoredWidth;
      posY.value = e.clientY - dragStartY;
      dragOffsetX = e.clientX - posX.value;
      dragOffsetY = e.clientY - posY.value;
      snap.value = null;
    }
  }
  posX.value = e.clientX - dragOffsetX;
  posY.value = e.clientY - dragOffsetY;
  snapPreview.value = detectSnapZone(e.clientX, e.clientY);
}

function onMouseUp(e: MouseEvent) {
  if (resizing) {
    resizing = false;
    return;
  }
  if (dragging) {
    const zone = detectSnapZone(e.clientX, e.clientY);
    if (zone === "max") {
      preSnapPos = { x: posX.value, y: posY.value };
      snap.value = "max";
    } else if (zone) {
      applySnapZone(zone);
    }
  }
  dragging = false;
  dragPending = false;
  snapPreview.value = null;
}

function toggleMaximize() {
  if (snap.value) {
    snap.value = null;
    posX.value = preSnapPos.x;
    posY.value = preSnapPos.y;
  } else {
    preSnapPos = { x: posX.value, y: posY.value };
    snap.value = "max";
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
  <Teleport to="body">
    <div v-if="snapPreview" class="snap-preview" :style="previewStyle!" />
  </Teleport>
  <Transition name="win-frame">
    <div
      v-if="open && !minimized"
      class="window-frame"
      :class="{ snapped: !!snap, unfocused: focused === false }"
      :style="{ ...snapStyle, zIndex: zIndex ?? 15 }"
      @mousedown="emit('focus')"
      @mouseup="emit('mouseup', $event)"
      @contextmenu.prevent
    >
      <!-- Resize handles -->
      <template v-if="snap !== 'max'">
        <div class="resize-handle resize-top" @mousedown.stop="onResizeMouseDown('top', $event)" />
        <div class="resize-handle resize-bottom" @mousedown.stop="onResizeMouseDown('bottom', $event)" />
        <div class="resize-handle resize-left" @mousedown.stop="onResizeMouseDown('left', $event)" />
        <div class="resize-handle resize-right" @mousedown.stop="onResizeMouseDown('right', $event)" />
        <div class="resize-handle resize-top-left" @mousedown.stop="onResizeMouseDown('top-left', $event)" />
        <div class="resize-handle resize-top-right" @mousedown.stop="onResizeMouseDown('top-right', $event)" />
        <div class="resize-handle resize-bottom-left" @mousedown.stop="onResizeMouseDown('bottom-left', $event)" />
        <div class="resize-handle resize-bottom-right" @mousedown.stop="onResizeMouseDown('bottom-right', $event)" />
      </template>
      <div class="title-bar" @mousedown="onTitleBarMouseDown" @dblclick="onTitleBarDblClick">
        <img v-if="icon" :src="icon" class="title-icon" alt="" />
        <span class="title-text">{{ title }}</span>
        <div class="title-buttons">
          <button class="title-btn" aria-label="Minimize" @click.stop="emit('minimize')">
            <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="6" x2="11" y2="6" stroke="#333" stroke-width="1" /></svg>
          </button>
          <button class="title-btn" aria-label="Maximize" @click.stop="toggleMaximize">
            <svg v-if="!snap" viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="#333" stroke-width="1" /></svg>
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
  display: flex;
  flex-direction: column;
  border: 1px solid #888;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  font-family: "Segoe UI", -apple-system, sans-serif;
  font-size: 12px;
}

.window-frame.snapped {
  border: none;
  box-shadow: none;
}

.snap-preview {
  position: fixed;
  background: rgba(100, 149, 237, 0.25);
  border: 2px solid rgba(100, 149, 237, 0.6);
  border-radius: 6px;
  z-index: 14;
  pointer-events: none;
  transition: all 0.15s ease;
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
  border-bottom: 1px solid #e0e0e0;
}

.unfocused .title-bar {
  background: #f0f0f0;
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
  overflow: hidden;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  z-index: 1;
}
.resize-top { top: -3px; left: 6px; right: 6px; height: 6px; cursor: n-resize; }
.resize-bottom { bottom: -3px; left: 6px; right: 6px; height: 6px; cursor: s-resize; }
.resize-left { left: -3px; top: 6px; bottom: 6px; width: 6px; cursor: w-resize; }
.resize-right { right: -3px; top: 6px; bottom: 6px; width: 6px; cursor: e-resize; }
.resize-top-left { top: -3px; left: -3px; width: 12px; height: 12px; cursor: nw-resize; }
.resize-top-right { top: -3px; right: -3px; width: 12px; height: 12px; cursor: ne-resize; }
.resize-bottom-left { bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: sw-resize; }
.resize-bottom-right { bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: se-resize; }
</style>
