<script setup lang="ts">
import type { FlatNavItem, NavNode } from "./types";
import thisPcIcon from "../../../assets/this-pc.svg";
import driveIcon from "../../../assets/drive.png";
import folderIcon from "../../../assets/folder.png";

defineProps<{
  flatNav: FlatNavItem[];
}>();

const emit = defineEmits<{
  "nav-click": [node: NavNode];
  "toggle-expand": [node: NavNode];
}>();
</script>

<template>
  <div class="nav-pane">
    <button
      v-for="item in flatNav"
      :key="item.depth + ':' + item.node.label + ':' + (item.node.path ?? '')"
      class="nav-item"
      :style="{ paddingLeft: (4 + item.depth * 20) + 'px' }"
      @click="emit('nav-click', item.node)"
    >
      <span
        class="nav-arrow"
        :class="{ expanded: item.node.expanded, hidden: item.node.loaded && (!item.node.children || item.node.children.length === 0) }"
        @click.stop="emit('toggle-expand', item.node)"
      >›</span>
      <svg v-if="item.node.icon === 'pin'" class="nav-icon" viewBox="0 0 16 16">
        <defs>
          <mask id="lines-mask">
            <rect width="16" height="16" fill="white" />
            <polygon points="9,1 11,6 16,6 12,9.5 13.5,15 9,11.5 4.5,15 6,9.5 2,6 7,6" fill="black" transform="matrix(1,0,-0.15,1,1.2,0)" />
          </mask>
        </defs>
        <polygon points="9,1 11,6 16,6 12,9.5 13.5,15 9,11.5 4.5,15 6,9.5 2,6 7,6" fill="#3b8eea" transform="matrix(1,0,-0.15,1,1.2,0)"/>
        <g mask="url(#lines-mask)" opacity="0.4">
          <line x1="0" y1="3.5" x2="8" y2="3.5" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0.5" y1="5" x2="8" y2="5" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0.5" y1="6.5" x2="5.5" y2="6.5" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0" y1="8" x2="5" y2="8" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0.5" y1="9.5" x2="4.5" y2="9.5" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0.5" y1="11" x2="4" y2="11" stroke="#3b8eea" stroke-width="0.7" />
          <line x1="0" y1="12.5" x2="3.5" y2="12.5" stroke="#3b8eea" stroke-width="0.7" />
        </g>
      </svg>
      <img v-else-if="item.node.icon === 'pc'" :src="thisPcIcon" class="nav-icon" alt="" />
      <img v-else-if="item.node.icon === 'drive'" :src="driveIcon" class="nav-icon" alt="" />
      <img v-else :src="folderIcon" class="nav-icon" alt="" />
      <span class="nav-label">{{ item.node.label }}<svg v-if="item.node.label === 'jason-portfolio' && item.node.icon === 'folder'" class="nav-star" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.5 10,3.5 7,5.8 8,9.5 5,7.2 2,9.5 3,5.8 0,3.5 3.8,3.5" fill="#e8b500"/></svg></span>
    </button>
  </div>
</template>

<style lang="css" scoped>
.nav-pane {
  width: 180px;
  background: #fff;
  border-right: 1px solid #ddd;
  padding: 4px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 2px 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: #333;
  text-align: left;
  white-space: nowrap;
}

.nav-item:hover {
  background: #e8e8e8;
}

.nav-arrow {
  width: 16px;
  text-align: center;
  font-size: 11px;
  color: #888;
  flex-shrink: 0;
  transition: transform 0.1s ease;
  display: inline-block;
  cursor: pointer;
  padding: 2px 0;
}

.nav-arrow.expanded {
  transform: rotate(90deg);
}

.nav-arrow.hidden {
  visibility: hidden;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-star {
  width: 10px;
  height: 10px;
  vertical-align: -1px;
  margin-left: 3px;
}
</style>
