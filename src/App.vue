<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import Sidebar from "./components/Sidebar.vue";

const conversations = [
  { slug: "cerium", title: "Cerium, Software Engineer" },
  { slug: "midnight-sky", title: "MidnightSky, Software Engineer" },
];

const DEFAULT_SLUG = "cerium";

const currentSlug = ref(window.location.hash.slice(1) || DEFAULT_SLUG);

watchEffect(() => {
  window.location.hash = currentSlug.value;
});

window.addEventListener("hashchange", () => {
  currentSlug.value = window.location.hash.slice(1);
});

const currentConversation = computed(() =>
  conversations.find((x) => x.slug === currentSlug.value),
);
</script>

<template>
  <div class="layout" v-if="currentConversation">
    <Sidebar />
    <Conversation
      v-if="currentConversation"
      :slug="currentSlug"
      :title="currentConversation.title"
    />
  </div>
  <div v-else class="not-found">
    <h1>Page not found</h1>
    <p>
      There's many pages of info about Jason here, but this isn't one of them.
    </p>
    <button @click="currentSlug = DEFAULT_SLUG">Go back home</button>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;

  background: #262624;
  color: #faf9f5;
  font-family: "Lora", serif;
}
</style>

<style lang="css" scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  min-height: 100vh;
}

.not-found h1 {
  font-size: 4rem;
  margin: 0;
}
</style>
