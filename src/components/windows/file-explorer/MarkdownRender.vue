<script setup lang="ts">
import { computed } from "vue";
import { renderMd } from "./markdown";

const props = defineProps<{
  source: string;
  baseUrl?: string;
}>();

const rendered = computed(() => renderMd(props.source, props.baseUrl));
</script>

<template>
  <div class="md-render" v-html="rendered"></div>
</template>

<style lang="css" scoped>
.md-render {
  color: #333;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.md-render :deep(h1) { font-size: 1.8em; margin: 0.5em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
.md-render :deep(h2) { font-size: 1.4em; margin: 0.5em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
.md-render :deep(h3) { font-size: 1.2em; margin: 0.5em 0 0.3em; }
.md-render :deep(h4) { font-size: 1.05em; margin: 0.4em 0 0.2em; }

.md-render :deep(p) { margin: 0.4em 0; }
.md-render :deep(ul), .md-render :deep(ol) { margin: 0.3em 0; padding-left: 24px; }
.md-render :deep(li) { margin: 0.15em 0; }
.md-render :deep(hr) { border: none; border-top: 1px solid #ddd; margin: 1em 0; }

.md-render :deep(code) {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.9em;
}

.md-render :deep(.md-code-block) {
  background: #f6f6f6;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px 12px;
  margin: 0.5em 0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}

.md-render :deep(.md-code-block) code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.md-render :deep(a) { color: #0078d4; text-decoration: none; }
.md-render :deep(a:hover) { text-decoration: underline; }
.md-render :deep(strong) { font-weight: 600; }
.md-render :deep(img) { max-width: 100%; height: auto; cursor: pointer; }

.md-render :deep(.img-expand-wrap) {
  position: relative;
  display: inline-block;
}

.md-render :deep(.img-expand-wrap)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7'/%3E%3C/svg%3E") no-repeat center;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;
  pointer-events: none;
  border-radius: 2px;
}

.md-render :deep(.img-expand-wrap):hover::after {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.3);
}
.md-render :deep(p[align="center"] .img-expand-wrap) { max-width: 50%; }
.md-render :deep(p[align="center"] img) { max-width: 100%; }
.md-render :deep(table) { border-collapse: collapse; margin: 0.5em 0; font-size: 12px; border: 1px solid #ddd; }
.md-render :deep(th), .md-render :deep(td) { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
.md-render :deep(th) { background: #f6f6f6; font-weight: 600; }
</style>
