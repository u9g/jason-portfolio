<script setup lang="ts">
import { ref, computed } from "vue";

const open = ref(false);
const copied = ref(false);

const urlInfo = computed(() => {
  if (import.meta.env.SSR) return { full: "", domain: "", path: "" };
  return {
    full: window.location.href,
    domain: window.location.origin,
    path: window.location.pathname,
  };
});

function copyLink() {
  navigator.clipboard.writeText(urlInfo.value.full);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function visitLink() {
  window.open(urlInfo.value.full, "_blank");
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) open.value = false;
}
</script>

<template>
  <button class="share-btn" @click="open = true">Share</button>
  <Teleport to="body">
    <div v-if="open" class="share-backdrop" @click="onBackdropClick">
      <div class="share-dialog">
        <div class="share-header">
          <span>Share link</span>
          <button class="close-btn" @click="open = false">&#10005;</button>
        </div>
        <div class="share-link-row">
          <button class="link-btn" @click="visitLink">
            <span class="link-text"><span class="link-domain">{{ urlInfo.domain }}</span><span class="link-path">{{ urlInfo.path }}</span></span>
            <div class="link-fade"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="link-arrow"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path></svg>
          </button>
          <button class="copy-btn" @click="copyLink">
            {{ copied ? "Copied!" : "Copy link" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="css" scoped>
.share-btn {
  margin-left: auto;
  background: transparent;
  border: 0.5px solid var(--text-dim);
  border-radius: 8px;
  color: var(--text-bright);
  cursor: pointer;
  width: 64px;
  height: 32px;
  margin-right: 12px;
  font-family: inherit;
  font-size: 0.8rem;
}

.share-btn:hover {
  background: #000;
}

.share-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.share-dialog {
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  width: 400px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-bright);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.close-btn:hover {
  color: var(--text-bright);
}

.share-link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-hover);
  border: 0.5px solid var(--border-color);
  border-radius: 12px;
  padding: 8px 12px;
  gap: 16px;
}

.link-btn {
  flex: 1;
  min-width: 0;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0;
  position: relative;
}

.link-btn:hover {
  color: var(--text-bright);
}

.link-text {
  display: flex;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  transition: max-width 0.2s ease;
}

.link-domain {
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.link-path {
  flex-shrink: 0;
  padding-right: 24px;
}

.link-btn:hover .link-text {
  max-width: calc(100% - 20px);
}

.link-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  background: linear-gradient(to left, var(--bg-hover), transparent);
  pointer-events: none;
  transition: right 0.2s ease;
}

.link-btn:hover .link-fade {
  right: 20px;
}

.link-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.link-btn:hover .link-arrow {
  opacity: 1;
}

.copy-btn {
  flex-shrink: 0;
  background: var(--text-bright);
  border: none;
  border-radius: 8px;
  color: var(--bg-base);
  cursor: pointer;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  min-width: 5rem;
  transition: transform 0.15s cubic-bezier(0.165, 0.85, 0.45, 1);
}

.copy-btn:hover {
  transform: scaleY(1.015) scaleX(1.005);
}

.copy-btn:active {
  transform: scale(0.985);
}
</style>
