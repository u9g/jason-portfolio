<script setup lang="ts">
import PromptBar from "./PromptBar.vue";

defineProps<{
  title: string;
  slug: string;
  conversation: { role: string; message: string }[];
}>();
</script>

<template>
  <div class="conversation">
    <div class="top-bar">
      {{ title }}
      <button>Share</button>
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
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  position: sticky;
  top: 0;
}

.top-bar button {
  background: transparent;
  border: 0.5px solid #6b6a65;
  border-radius: 8px;
  color: #faf9f5;
  cursor: pointer;
  width: 64px;
  height: 32px;
  margin-right: 12px;
  font-family: inherit;
  font-size: 0.8rem;
}

.top-bar button:hover {
  background: #000;
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
  background: #141413;
  color: #faf9f5;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}</style>
