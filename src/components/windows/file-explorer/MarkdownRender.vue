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
.md-render :deep(ul) { margin: 0.3em 0; padding-left: 24px; }
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
.md-render :deep(img) { max-width: 50%; height: auto; }
.md-render :deep(table) { border-collapse: collapse; margin: 0.5em 0; font-size: 12px; border: 1px solid #ddd; }
.md-render :deep(th), .md-render :deep(td) { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
.md-render :deep(th) { background: #f6f6f6; font-weight: 600; }
</style>
