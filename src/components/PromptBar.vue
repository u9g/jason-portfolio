<script setup lang="ts">
import { ref } from "vue";

const hasText = ref(false);
const isListening = ref(false);
const promptInput = ref<HTMLElement | null>(null);

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;
let recognition: any = null;

if (speechSupported) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    const el = promptInput.value;
    if (!el) return;

    let final = "";
    let interim = "";
    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    el.innerText = final + interim;
    hasText.value = el.innerText.trim() !== "";
  };

  recognition.onend = () => {
    isListening.value = false;
  };
}

function toggleListening() {
  if (!recognition) return;
  if (isListening.value) {
    recognition.stop();
    isListening.value = false;
  } else {
    recognition.start();
    isListening.value = true;
  }
}

function onInput(e: Event) {
  const el = e.target as HTMLElement;
  if (el.innerText.trim() === "") {
    el.innerHTML = "";
    hasText.value = false;
  } else {
    hasText.value = true;
  }
}
</script>

<template>
  <div class="prompt-bar-wrapper">
    <div class="prompt-bar">
      <div ref="promptInput" class="prompt-input" :class="{ 'input-disabled': isListening }" :contenteditable="!isListening" role="textbox" aria-label="Write your prompt" data-placeholder="Reply to Jason..." @input="onInput"></div>
      <div class="prompt-actions">
        <button class="prompt-icon-btn" aria-label="Attach">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 3a.5.5 0 0 1 .5.5v6h6l.1.01a.5.5 0 0 1 0 .98l-.1.01h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 10 3"></path></svg>
        </button>
        <button v-if="hasText && !isListening" class="prompt-send-btn send-active" aria-label="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path></svg>
        </button>
        <button v-else class="prompt-send-btn" :class="{ listening: isListening }" aria-label="Voice input" :disabled="!speechSupported" @click="toggleListening">
          <svg class="audio-waves" width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="wave wave-1" x="4" y="5.5" height="10" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect>
            <rect class="wave wave-2" x="10" y="3.5" height="14" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect>
            <rect class="wave wave-3" x="16" y="5.5" height="10" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.prompt-bar-wrapper {
  margin-top: auto;
  padding: 12px 16px 16px;
  position: sticky;
  bottom: 0;
}

.prompt-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 0.5px solid var(--border-color);
  background: var(--bg-raised);
  box-shadow:
    0 0.25rem 1.25rem rgba(0, 0, 0, 0.035),
    0 0 0 0.5px rgba(66, 65, 61, 0.15);
  transition: box-shadow 0.2s ease;
}

.prompt-bar:hover {
  box-shadow:
    0 0.25rem 1.25rem rgba(0, 0, 0, 0.035),
    0 0 0 0.5px rgba(66, 65, 61, 0.3);
}

.prompt-bar:focus-within {
  box-shadow:
    0 0.25rem 1.25rem rgba(0, 0, 0, 0.075),
    0 0 0 0.5px rgba(66, 65, 61, 0.3);
}

.prompt-input {
  min-height: 1.5rem;
  max-height: 24rem;
  overflow-y: auto;
  outline: none;
  color: var(--text-mid);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 300;
  padding: 0 6px;
  word-break: break-word;
}

.prompt-input:empty::before {
  content: attr(data-placeholder);
  color: var(--text-mid);
  pointer-events: none;
}

.prompt-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt-icon-btn,
.prompt-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-mid);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.prompt-icon-btn {
  cursor: not-allowed;
}

.prompt-send-btn:hover {
  background: var(--bg-hover-light);
  color: var(--text-bright);
}

.input-disabled {
  cursor: not-allowed;
}

.listening {
  color: #c66140;
}

.listening .wave {
  animation: wave-bounce 0.8s ease-in-out infinite;
  transform-origin: center;
}

.listening .wave-1 { animation-delay: 0s; }
.listening .wave-2 { animation-delay: 0.15s; }
.listening .wave-3 { animation-delay: 0.3s; }

@keyframes wave-bounce {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1.2); }
}

.send-active {
  background: #c66140;
  color: var(--text-bright);
  border-radius: 10px;
}

.send-active:hover {
  background: #d97857;
  color: var(--text-bright);
}
</style>
