<script setup lang="ts">
import { ref } from "vue";
import sidebarToggleIcon from "../assets/sidebar-toggle.svg";
import plusIcon from "../assets/plus.svg";

defineProps<{
  conversations: { slug: string; title: string }[];
  currentSlug: string;
}>();

const emit = defineEmits<{ navigate: [slug: string] }>();

const isCollapsed = ref(false);
</script>

<template>
  <aside :class="{ collapsed: isCollapsed }">
    <div class="row top-row">
      <span class="sidebar-text">Jason</span>

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
          <img :src="plusIcon" style="flex-shrink: 0" />
        </span>
        <span class="sidebar-text">New Chat</span>
      </button>
    </div>

    <div class="recent-section sidebar-text">
      <span class="recent-heading">Recent Job Experience</span>
      <button
        v-for="conv in conversations"
        :key="conv.slug"
        class="recent-item"
        :class="{ active: conv.slug === currentSlug }"
        @click="emit('navigate', conv.slug)"
      >
        {{ conv.title }}
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
  transition: width 0.15s ease;
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
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: #383735;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.new-chat-btn:hover .plus-circle {
  transform: scale(1.1);
}

.plus-circle img {
  width: 14px;
  height: 14px;
  filter: brightness(0) invert(0.75);
  transition: filter 0.2s ease;
}

.new-chat-btn:hover .plus-circle img {
  filter: brightness(0) invert(1);
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #c2c0b6;
  white-space: nowrap;
  border-radius: 10px;
  padding: 3px 12px 3px 6px;
  width: 100%;
  height: 32px;
  font-size: 0.8rem;
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
  gap: 0;
}

.recent-section {
  display: flex;
  flex-direction: column;
  padding: 8px 8px 0;
  gap: 2px;
}

.recent-heading {
  font-size: 0.7rem;
  color: #6b6a65;
  padding: 4px 6px;
  user-select: none;
}

.recent-item {
  font-size: 0.8rem;
  color: #c2c0b6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 8px;
  padding: 0 8px;
  height: 32px;
  text-align: left;
}

.recent-item:hover {
  color: #faf9f5;
}

.recent-item.active {
  background: #141413;
  color: #faf9f5;
}

.sidebar-text {
  opacity: 1;
  transition: opacity 0.15s ease 0.1s;
}

aside.collapsed .sidebar-text {
  opacity: 0;
  width: 0;
  padding: 0;
  overflow: hidden;
  transition: opacity 0.05s ease, width 0s 0.05s, padding 0s 0.05s;
}
</style>
