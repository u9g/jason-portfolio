<script setup lang="ts">
const props = defineProps({
  title: String,
  slug: String,
});

const conversation = [
  { role: "user", message: "What's Cerium" },
  {
    role: "assistant",
    message:
      "Cerium is an iOS app that I built to learn Swift, XCode, and AI model APIs.",
  },
];
</script>

<template>
  <div class="row">
    {{ title }}

    <button>Share</button>
  </div>
  <!-- title -->
</template>
