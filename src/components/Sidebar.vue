<script setup lang="ts">
import { ref } from "vue";
import sidebarToggleIcon from "../assets/sidebar-toggle.svg";

const isCollapsed = ref(false);
</script>

<template>
  <aside :class="{ collapsed: isCollapsed }">
    <div class="row top-row">
      <span v-if="!isCollapsed">Jason</span>

      <button @click="isCollapsed = !isCollapsed" class="icon-btn">
        <img
          :src="sidebarToggleIcon"
          class="transition text-text-400 group-hover:text-text-100"
          style="flex-shrink: 0; filter: brightness(0) invert(1)"
        />
      </button>
    </div>
  </aside>
</template>

<style lang="css" scoped>
.top-row {
  padding: 8px;

  font-size: large;
}

.top-row span {
  padding-left: 8px;
}

aside {
  width: 260px;
  border-right: 1px solid #42413d;
  overflow: hidden;
  transition: width 0.25s ease;
}

button {
  background: transparent;
}

button:hover {
  background: #141413;
}

.collapsed {
  width: calc(32px + 1em);
}

.icon-btn {
  width: 32px;
  height: 32px;

  border-radius: 10px;
  cursor: pointer;

  color: #faf9f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
