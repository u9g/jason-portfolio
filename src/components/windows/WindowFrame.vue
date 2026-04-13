<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

type SnapZone = "max" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;

const SNAP_GEOMETRY: Record<Exclude<SnapZone, null>, { x: number; y: number; w: number; h: number }> = {
  max:            { x: 0,   y: 0,   w: 1,   h: 1 },
  left:           { x: 0,   y: 0,   w: 0.5, h: 1 },
  right:          { x: 0.5, y: 0,   w: 0.5, h: 1 },
  "top-left":     { x: 0,   y: 0,   w: 0.5, h: 0.5 },
  "top-right":    { x: 0.5, y: 0,   w: 0.5, h: 0.5 },
  "bottom-left":  { x: 0,   y: 0.5, w: 0.5, h: 0.5 },
  "bottom-right": { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
};

const props = defineProps<{
  open: boolean;
  title: string;
  icon?: string;
  zIndex?: number;
  focused?: boolean;
  minimized?: boolean;
  initialX?: number;
  initialY?: number;
}>();

const emit = defineEmits<{
  close: [];
  minimize: [];
  focus: [];
  mouseup: [e: MouseEvent];
}>();

const snap = ref<SnapZone>(null);
const snapPreview = ref<SnapZone>(null);
const posX = ref(props.initialX ?? 100);
const posY = ref(props.initialY ?? 60);
const winW = ref(DEFAULT_W);
const winH = ref(DEFAULT_H);
let preSnap = { x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H };
const DRAG_THRESHOLD = 4;
const EDGE = 8;
const CORNER = 50;
const TASKBAR = 40;
const MIN_W = 300;
const MIN_H = 200;
const DEFAULT_W = 750;
const DEFAULT_H = 500;

const drag = { pending: false, active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 };

type ResizeDir = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
const resizeDirs: ResizeDir[] = ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"];
const RESIZE_SIGN: Record<ResizeDir, { dx: number; dy: number; dw: number; dh: number }> = {
  right:          { dx: 0, dy: 0, dw: 1,  dh: 0 },
  left:           { dx: 1, dy: 0, dw: -1, dh: 0 },
  bottom:         { dx: 0, dy: 0, dw: 0,  dh: 1 },
  top:            { dx: 0, dy: 1, dw: 0,  dh: -1 },
  "top-left":     { dx: 1, dy: 1, dw: -1, dh: -1 },
  "top-right":    { dx: 0, dy: 1, dw: 1,  dh: -1 },
  "bottom-left":  { dx: 1, dy: 0, dw: -1, dh: 1 },
  "bottom-right": { dx: 0, dy: 0, dw: 1,  dh: 1 },
};
const resize = { active: false, dir: "right" as ResizeDir, startX: 0, startY: 0, startW: 0, startH: 0, startPosX: 0, startPosY: 0 };

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
  if (!snap.value) {
    return { left: posX.value + "px", top: posY.value + "px", width: winW.value + "px", height: winH.value + "px" };
  }
  const g = SNAP_GEOMETRY[snap.value];
  return {
    left: `${g.x * 100}vw`,
    top: `calc((100vh - ${TASKBAR}px) * ${g.y})`,
    width: `${g.w * 100}vw`,
    height: `calc((100vh - ${TASKBAR}px) * ${g.h})`,
  };
});

const previewStyle = computed(() => {
  if (!snapPreview.value) return null;
  const g = SNAP_GEOMETRY[snapPreview.value];
  return {
    left: `${g.x * 100}vw`,
    top: `calc((100vh - ${TASKBAR}px) * ${g.y})`,
    width: `${g.w * 100}vw`,
    height: `calc((100vh - ${TASKBAR}px) * ${g.h})`,
  };
});

function onTitleBarMouseDown(e: MouseEvent) {
  drag.pending = true;
  drag.active = false;
  drag.startX = e.clientX;
  drag.startY = e.clientY;
  if (!snap.value) {
    drag.offsetX = e.clientX - posX.value;
    drag.offsetY = e.clientY - posY.value;
  }
}

function onResizeMouseDown(dir: ResizeDir, e: MouseEvent) {
  e.preventDefault();
  resize.active = true;
  resize.dir = dir;
  resize.startX = e.clientX;
  resize.startY = e.clientY;
  resize.startW = winW.value;
  resize.startH = winH.value;
  resize.startPosX = posX.value;
  resize.startPosY = posY.value;
}

function onResizeDblClick(dir: ResizeDir) {
  const s = RESIZE_SIGN[dir];
  if (s.dw !== 0) winW.value = DEFAULT_W;
  if (s.dh !== 0) winH.value = DEFAULT_H;
}

function onMouseMove(e: MouseEvent) {
  if (resize.active) {
    const dx = e.clientX - resize.startX;
    const dy = e.clientY - resize.startY;
    const s = RESIZE_SIGN[resize.dir];
    const newW = Math.max(MIN_W, resize.startW + s.dw * dx);
    const newH = Math.max(MIN_H, resize.startH + s.dh * dy);
    posX.value = resize.startPosX + s.dx * (resize.startW - newW);
    posY.value = resize.startPosY + s.dy * (resize.startH - newH);
    winW.value = newW;
    winH.value = newH;
    return;
  }
  if (!drag.pending && !drag.active) return;
  if (drag.pending && !drag.active) {
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    drag.active = true;
    drag.pending = false;
    if (snap.value) {
      const restoredWidth = preSnap.w;
      const fractionX = drag.startX / window.innerWidth;
      posX.value = e.clientX - fractionX * restoredWidth;
      posY.value = e.clientY - drag.startY;
      drag.offsetX = e.clientX - posX.value;
      drag.offsetY = e.clientY - posY.value;
      winW.value = preSnap.w;
      winH.value = preSnap.h;
      snap.value = null;
    }
  }
  posX.value = e.clientX - drag.offsetX;
  posY.value = e.clientY - drag.offsetY;
  snapPreview.value = detectSnapZone(e.clientX, e.clientY);
}

function onMouseUp(e: MouseEvent) {
  if (resize.active) {
    resize.active = false;
    return;
  }
  if (drag.active) {
    const zone = detectSnapZone(e.clientX, e.clientY);
    if (zone) {
      preSnap = { x: posX.value, y: posY.value, w: winW.value, h: winH.value };
      snap.value = zone;
    }
  }
  drag.active = false;
  drag.pending = false;
  snapPreview.value = null;
}

function toggleMaximize() {
  if (snap.value) {
    snap.value = null;
    posX.value = preSnap.x;
    posY.value = preSnap.y;
    winW.value = preSnap.w;
    winH.value = preSnap.h;
  } else {
    preSnap = { x: posX.value, y: posY.value, w: winW.value, h: winH.value };
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
      <template v-if="!snap">
        <div v-for="dir in resizeDirs" :key="dir"
             :class="['resize-handle', `resize-${dir}`]"
             @mousedown.stop="onResizeMouseDown(dir, $event)"
             @dblclick.stop="onResizeDblClick(dir)" />
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
