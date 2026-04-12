<script setup lang="ts">
import type { GHEntry } from "../../../data/github-fs";
import folderIcon from "../../../assets/folder.png";
import fileTextIcon from "../../../assets/file-text.png";
import { formatSize, getFileType, rawUrl } from "./helpers";

const props = defineProps<{
  entries: GHEntry[];
  currentRepo: string;
}>();

const emit = defineEmits<{
  "entry-click": [entry: GHEntry];
}>();
</script>

<template>
  <div class="column-headers">
    <span class="col-name">Name</span>
    <span class="col-type">Type</span>
    <span class="col-size">Size</span>
  </div>
  <div class="file-list">
    <button
      v-for="entry in entries"
      :key="entry.path"
      class="file-entry"
      @click="emit('entry-click', entry)"
    >
      <span class="col-name">
        <img v-if="entry.type === 'dir'" :src="folderIcon" class="entry-icon" alt="" />
        <img v-else-if="entry.name.endsWith('.svg')" :src="rawUrl(entry.path, props.currentRepo)" class="entry-icon svg-entry-icon" alt="" />
        <img v-else :src="fileTextIcon" class="entry-icon" alt="" />
        <span class="entry-label">{{ entry.name }}<svg v-if="entry.path === '__repo__:jason-portfolio'" class="entry-star" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.5 10,3.5 7,5.8 8,9.5 5,7.2 2,9.5 3,5.8 0,3.5 3.8,3.5" fill="#e8b500"/></svg></span>
      </span>
      <span class="col-type">{{ entry.type === 'dir' ? 'File folder' : getFileType(entry.name) }}</span>
      <span class="col-size">{{ entry.type === 'file' ? formatSize(entry.size) : '' }}</span>
    </button>
  </div>
</template>

<style lang="css" scoped>
.column-headers {
  display: flex;
  padding: 4px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  color: #666;
  font-size: 11px;
  flex-shrink: 0;
}

.column-headers .col-name {
  flex: 2;
}

.column-headers .col-type {
  flex: 1;
}

.column-headers .col-size {
  width: 80px;
  text-align: right;
}

.file-list {
  flex: 1;
  overflow-y: auto;
}

.file-entry {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 3px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: #333;
  text-align: left;
}

.file-entry:hover {
  background: #e8f0fe;
}

.file-entry .col-name {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.file-entry .col-type {
  flex: 1;
  color: #666;
}

.file-entry .col-size {
  width: 80px;
  text-align: right;
  color: #666;
}

.entry-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.entry-star {
  width: 11px;
  height: 11px;
  vertical-align: -1px;
  margin-left: 4px;
}

.entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.svg-entry-icon {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  object-fit: contain;
}
</style>
