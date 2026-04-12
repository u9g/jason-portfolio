<script setup lang="ts">
import { PINNED_REPOS } from "../../../data/github-fs";
import folderIcon from "../../../assets/folder.png";
import driveIcon from "../../../assets/drive.png";

const emit = defineEmits<{
  "open-repo": [owner: string, name: string];
  "show-drive": [];
}>();
</script>

<template>
  <div class="this-pc-view">
    <button class="section-header">
      <span class="section-arrow">▾</span>
      Folders
    </button>
    <div class="folder-grid">
      <button
        v-for="repo in PINNED_REPOS"
        :key="repo.owner + '/' + repo.name"
        class="folder-tile"
        @click="emit('open-repo', repo.owner, repo.name)"
      >
        <img :src="folderIcon" class="folder-tile-icon" alt="" />
        <span class="folder-tile-label">{{ repo.name }}</span>
      </button>
    </div>
    <button class="section-header">
      <span class="section-arrow">▾</span>
      Devices and drives
    </button>
    <div class="drive-grid">
      <button class="drive-tile" @click="emit('show-drive')">
        <img :src="driveIcon" class="drive-tile-icon" alt="" />
        <div class="drive-tile-info">
          <span class="drive-tile-label">Jason's Github (D:)</span>
          <div class="drive-bar">
            <div class="drive-bar-fill"></div>
          </div>
          <span class="drive-tile-space">∞ GB free of ∞ GB</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.this-pc-view {
  padding: 8px 16px;
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  color: #0078d4;
  cursor: pointer;
  padding: 6px 0;
  width: 100%;
  text-align: left;
}

.section-header:hover {
  color: #005a9e;
}

.section-arrow {
  font-size: 10px;
  color: #666;
}

.folder-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.folder-tile {
  width: 130px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-tile:hover {
  background: #e8f0fe;
  border-color: #c0d0e8;
}

.folder-tile-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.folder-tile-label {
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drive-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.drive-tile {
  width: 260px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
}

.drive-tile:hover {
  background: #e8f0fe;
  border-color: #c0d0e8;
}

.drive-tile-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.drive-tile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.drive-tile-label {
  font-size: 12px;
  color: #333;
}

.drive-bar {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 1px;
  overflow: hidden;
}

.drive-bar-fill {
  width: 35%;
  height: 100%;
  background: #0078d4;
}

.drive-tile-space {
  font-size: 11px;
  color: #888;
}
</style>
