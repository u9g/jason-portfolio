<script setup lang="ts">
import fileExplorerIcon from "../../assets/file-explorer.svg";
import claudeIcon from "../../assets/claude.svg";
import resumeIcon from "../../assets/resume.svg";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "print-resume": [];
}>();

const menuItems = [
  { name: "File Explorer", icon: fileExplorerIcon },
];

const tiles = [
  { name: "Document Mode", color: "#0078d4", wide: false, href: "/" },
  { name: "Claude Mode", color: "#5a5a5a", wide: false, href: "/claude" },
  { name: "Printable Resume", color: "#d44a4a", wide: true, href: undefined },
];
</script>

<template>
  <Transition name="start-menu">
    <div v-if="open" class="start-menu" @click.stop>
      <div class="sidebar">
        <div class="sidebar-top">
          <button class="sidebar-btn" aria-label="Menu">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="white">
              <rect x="2" y="3" width="12" height="1.5" />
              <rect x="2" y="7.25" width="12" height="1.5" />
              <rect x="2" y="11.5" width="12" height="1.5" />
            </svg>
          </button>
        </div>
        <div class="sidebar-bottom">
          <button class="sidebar-btn" aria-label="User">
            <svg viewBox="0 0 16 16" width="19" height="19">
              <defs>
                <mask id="user-mask">
                  <rect width="16" height="16" fill="white" />
                  <circle cx="8" cy="5.5" r="2.3" fill="black" />
                  <circle cx="8" cy="5.5" r="1.5" fill="white" />
                  <path d="M5 11c0-1.5 1.3-3 3-3s3 1.5 3 3" fill="none" stroke="black" stroke-width="1" />
                </mask>
              </defs>
              <circle cx="8" cy="8" r="7.5" fill="white" mask="url(#user-mask)" />
            </svg>
          </button>
          <a class="sidebar-btn" href="/" aria-label="Power">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="white" stroke-width="1.5">
              <line x1="8" y1="1" x2="8" y2="7" />
              <path d="M4.5 3.5a6 6 0 1 0 7 0" stroke-linecap="round" />
            </svg>
          </a>
        </div>
      </div>
      <div class="app-list">
        <div class="app-list-header">F</div>
        <button
          v-for="(item, i) in menuItems"
          :key="item.name"
          class="app-item slide-up"
          :style="{ animationDelay: `${i * 30}ms` }"
        >
          <img :src="item.icon" alt="" class="app-icon-img" />
          <span class="app-name">{{ item.name }}</span>
        </button>
      </div>
      <div class="tiles">
        <a
          v-for="tile in tiles"
          :key="tile.name"
          class="tile slide-up"
          :class="{ wide: tile.wide }"
          :style="{ background: tile.color }"
          :href="tile.href"
          @click="tile.name === 'Printable Resume' ? emit('print-resume') : undefined"
        >
          <img v-if="tile.name === 'Claude Mode'" :src="claudeIcon" alt="" class="tile-icon" />
          <svg v-else-if="tile.name === 'Document Mode'" class="tile-icon" viewBox="0 0 24 24" fill="white">
            <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3z" />
          </svg>
          <img v-else-if="tile.name === 'Printable Resume'" :src="resumeIcon" alt="" class="tile-icon resume-icon" />
          <span class="tile-label">{{ tile.name }}</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
.start-menu {
  position: absolute;
  bottom: 40px;
  left: 0;
  display: flex;
  width: 600px;
  height: 500px;
  background: rgba(0, 40, 80, 0.3);
  backdrop-filter: blur(30px) saturate(1.5);
  z-index: 20;
  font-family: "Segoe UI", -apple-system, sans-serif;
  color: white;
  transform-origin: bottom left;
}

.start-menu-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.start-menu-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.start-menu-enter-from,
.start-menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.sidebar {
  width: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.sidebar-top,
.sidebar-bottom {
  display: flex;
  flex-direction: column;
}

.sidebar-btn {
  width: 48px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger {
  font-size: 18px;
}

.sidebar-icon {
  font-size: 16px;
}

.app-list {
  width: 220px;
  padding: 8px 0;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.app-list-header {
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: white;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.app-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.app-icon-img {
  width: 24px;
  height: 24px;
}

.tiles {
  flex: 1;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  align-content: start;
}

.tile {
  height: 80px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 4px;
  position: relative;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  color: white;
}

.tile-icon {
  width: 32px;
  height: 32px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.tile-label {
  font-size: 11px;
}

.resume-icon {
  filter: brightness(0) invert(1);
}

.tile:hover {
  filter: brightness(1.15);
}

.tile.wide {
  grid-column: span 2;
}

.slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
