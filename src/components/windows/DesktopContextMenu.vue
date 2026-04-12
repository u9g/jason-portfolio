<script setup lang="ts">
import { computed } from "vue";
import homeIcon from "../../assets/home.svg";

const props = defineProps<{
  open: boolean;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  close: [];
  "next-background": [];
  "prev-background": [];
}>();

const menuWidth = 200;
const menuHeight = 64;

const position = computed(() => {
  const left =
    props.x + menuWidth > window.innerWidth
      ? window.innerWidth - menuWidth - 4
      : props.x;
  const top =
    props.y + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 4
      : props.y;
  return { left: `${left}px`, top: `${top}px` };
});
</script>

<template>
  <Transition name="ctx-menu">
    <div
      v-if="open"
      class="context-menu"
      :style="position"
      @click.stop
      @contextmenu.prevent.stop
    >
      <button class="ctx-item" @click="emit('prev-background'); emit('close')">
        <svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5"><path d="M10 3L5 8l5 5"/></svg>
        Previous background
      </button>
      <button class="ctx-item" @click="emit('next-background'); emit('close')">
        <svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg>
        Next background
      </button>
      <div class="ctx-divider" />
      <a class="ctx-item" href="/">
        <img :src="homeIcon" class="ctx-icon ctx-icon-img" aria-hidden="true" />
        Exit to Document Mode
      </a>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
.context-menu {
  position: fixed;
  width: 200px;
  padding: 4px 0;
  background: rgba(43, 43, 43, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5);
  z-index: 25;
  font-family: "Segoe UI", -apple-system, sans-serif;
  color: white;
}

.ctx-menu-enter-active,
.ctx-menu-leave-active {
  transition: opacity 0.1s ease;
}

.ctx-menu-enter-from,
.ctx-menu-leave-to {
  opacity: 0;
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 3px 28px 3px 28px;
  background: transparent;
  border: none;
  color: white;
  font-family: inherit;
  font-size: 12px;
  text-align: left;
  text-decoration: none;
  cursor: default;
}

.ctx-icon {
  width: 14px;
  height: 14px;
  margin-left: -20px;
}

.ctx-icon.ctx-icon-img {
  filter: brightness(0) invert(1);
}

.ctx-divider {
  height: 1px;
  margin: 4px 0;
  background: rgba(255, 255, 255, 0.2);
}

.ctx-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
