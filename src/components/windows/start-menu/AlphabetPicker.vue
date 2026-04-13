<script setup lang="ts">
const props = defineProps<{
  alphabet: string[];
  availableLetters: string[];
}>();

const emit = defineEmits<{
  jump: [letter: string];
}>();

function isAvailable(letter: string) {
  return props.availableLetters.includes(letter);
}
</script>

<template>
  <div class="app-list-view letter-picker" aria-label="Application letters">
    <button
      v-for="(letter, letterIndex) in alphabet"
      :key="letter"
      class="letter-picker-item letter-zoom"
      :class="{ available: isAvailable(letter) }"
      :style="{ animationDelay: `${letterIndex * 10}ms` }"
      :disabled="!isAvailable(letter)"
      @click="emit('jump', letter)"
    >
      {{ letter }}
    </button>
  </div>
</template>

<style lang="css" scoped>
.app-list-view {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.letter-picker {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 12px;
}

.letter-picker-item {
  height: 40px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  font-family: inherit;
  font-size: 14px;
  cursor: default;
}

.letter-picker-item.available {
  color: white;
  cursor: pointer;
}

.letter-picker-item.available:hover,
.letter-picker-item.available:focus,
.letter-picker-item.available:active {
  background: rgba(255, 255, 255, 0.16);
  color: white;
  outline: none;
}

.letter-picker-item:disabled {
  opacity: 1;
}

.letter-zoom {
  animation: letterZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-origin: center;
}

@keyframes letterZoomIn {
  from {
    opacity: 0;
    transform: scale(0.72);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
