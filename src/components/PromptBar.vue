<template>
  <div class="prompt-bar-wrapper">
    <div class="prompt-bar">
      <div class="prompt-input" contenteditable="true" role="textbox" aria-label="Write your prompt" data-placeholder="Reply to Jason..."></div>
      <div class="prompt-actions">
        <button class="prompt-icon-btn" aria-label="Attach">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 3a.5.5 0 0 1 .5.5v6h6l.1.01a.5.5 0 0 1 0 .98l-.1.01h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 10 3"></path></svg>
        </button>
        <button class="prompt-send-btn" aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="7.5" height="6" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect><rect x="4" y="5.5" height="10" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect><rect x="8" y="2.5" height="16" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect><rect x="12" y="5.5" height="10" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect><rect x="16" y="2.5" height="16" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect><rect x="20" y="7.5" height="6" fill="currentColor" width="1" rx="0.5" ry="0.5"></rect></svg>
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
  color: var(--text-bright);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 300;
  padding: 0 6px;
  word-break: break-word;
}

.prompt-input:empty::before {
  content: attr(data-placeholder);
  color: var(--text-dim);
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
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.prompt-icon-btn:hover,
.prompt-send-btn:hover {
  background: var(--bg-hover-light);
  color: var(--text-bright);
}
</style>
