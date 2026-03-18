<script setup lang="ts">
import Emails from './components/MainScreen.vue'
import Sidebar from './components/Sidebar.vue';
</script>

<template>
  <div class="layout">
    <Sidebar />
    <Emails />
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
</style>
