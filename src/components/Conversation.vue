<script setup lang="ts">
import PromptBar from "./PromptBar.vue";
import ShareButton from "./ShareButton.vue";

defineProps<{
  title: string;
  slug: string;
  conversation: { role: string; message: string }[];
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();
</script>

<template>
  <div class="conversation">
    <div class="top-bar">
      <button v-if="sidebarCollapsed" class="sidebar-toggle" @click="emit('toggleSidebar')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"></path></svg>
      </button>
      {{ title }}
      <ShareButton />
    </div>
    <div class="messages">
      <div
        v-for="(msg, i) in conversation"
        :key="i"
        :class="['message', msg.role]"
      >
        {{ msg.message }}
      </div>
    </div>

    <PromptBar />
  </div>
</template>

<style lang="css" scoped>
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 56px;
  position: sticky;
  top: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.sidebar-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0;
  color: var(--text-muted);
}

.sidebar-toggle:hover {
  background: var(--bg-hover);
}

@media (min-width: 1025px) {
  .sidebar-toggle {
    display: none;
  }
}


.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 300;
}

.message.user {
  align-self: flex-end;
  background: var(--bg-hover);
  color: var(--text-bright);
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}</style>
