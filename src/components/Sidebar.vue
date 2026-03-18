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

    <div class="new-chat-row">
      <button class="new-chat-btn">
        <span class="plus-circle">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style="flex-shrink: 0"
          >
            <path
              d="M10 3C10.4142 3 10.75 3.33579 10.75 3.75V9.25H16.25C16.6642 9.25 17 9.58579 17 10C17 10.3882 16.7051 10.7075 16.3271 10.7461L16.25 10.75H10.75V16.25C10.75 16.6642 10.4142 17 10 17C9.58579 17 9.25 16.6642 9.25 16.25V10.75H3.75C3.33579 10.75 3 10.4142 3 10C3 9.58579 3.33579 9.25 3.75 9.25H9.25V3.75C9.25 3.33579 9.58579 3 10 3Z"
            ></path>
          </svg>
        </span>
        <span v-if="!isCollapsed">New Chat</span>
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

button {
  cursor: pointer;

  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.icon-btn {
  width: 32px;
  height: 32px;

  border-radius: 10px;

  color: #faf9f5;
}

.new-chat-row {
  padding: 0 8px;
}

.plus-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #383735;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.new-chat-btn:hover .plus-circle {
  transform: rotate(-5deg);
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #c2c0b6;
  white-space: nowrap;
  border-radius: 10px;
  padding: 4px 16px 4px 8px;
  width: 100%;
}

.new-chat-btn:hover {
  color: #faf9f5;
}

aside.collapsed .new-chat-row {
  padding: 0 8px;
}

aside.collapsed .new-chat-btn {
  justify-content: center;
  padding: 4px;
}
</style>
