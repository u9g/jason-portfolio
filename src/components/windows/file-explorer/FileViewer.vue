<script setup lang="ts">
import { computed, ref } from "vue";
import { renderMd } from "./markdown";

const props = defineProps<{
  fileName: string;
  fileContent: string;
  fileLoading: boolean;
  currentRepo: string;
}>();

const isMarkdown = computed(() => props.fileName.endsWith(".md"));
const renderedMarkdown = computed(() => isMarkdown.value ? renderMd(props.fileContent) : "");

const isSvg = computed(() => props.fileName.endsWith(".svg"));
const svgDataUrl = computed(() => {
  if (!isSvg.value || !props.fileContent) return "";
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(props.fileContent)))}`;
});

const svgLines = computed(() => props.fileContent.split("\n"));
const svgPreviewRef = ref<HTMLElement | null>(null);
const hoveredLine = ref(-1);
const highlightBox = ref<{ x: number; y: number; w: number; h: number } | null>(null);

function onSvgLineHover(lineIndex: number) {
  hoveredLine.value = lineIndex;
  highlightBox.value = null;

  const container = svgPreviewRef.value;
  if (!container) return;
  const svgEl = container.querySelector(".svg-hidden-render svg");
  if (!svgEl) return;

  const line = svgLines.value[lineIndex];
  if (!line) return;

  const tagMatch = line.match(/<(\w+)[\s/>]/);
  if (!tagMatch) return;
  const tagName = tagMatch[1].toLowerCase();
  if (tagName === "svg" || tagName === "defs" || tagName === "mask" || tagName === "clippath" || tagName === "lineargradient" || tagName === "radialgradient" || tagName === "stop" || tagName === "pattern" || tagName === "symbol" || tagName === "marker") return;

  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    const m = svgLines.value[i].match(/<(\w+)[\s/>]/);
    if (m && m[1].toLowerCase() === tagName) count++;
  }

  const matches = svgEl.querySelectorAll(tagName);
  const el = matches[count];
  if (!el) return;

  try {
    const bbox = (el as SVGGraphicsElement).getBBox();
    const imgEl = container.querySelector(".svg-preview-img") as HTMLElement | null;
    if (!imgEl) return;
    const imgRect = imgEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const svgViewBox = (svgEl as SVGSVGElement).viewBox.baseVal;
    const vbW = svgViewBox.width || imgRect.width;
    const vbH = svgViewBox.height || imgRect.height;
    const scaleX = imgRect.width / vbW;
    const scaleY = imgRect.height / vbH;

    highlightBox.value = {
      x: (bbox.x * scaleX) + imgRect.left - containerRect.left,
      y: (bbox.y * scaleY) + imgRect.top - containerRect.top,
      w: bbox.width * scaleX,
      h: bbox.height * scaleY,
    };
  } catch {
    // getBBox can fail on hidden elements
  }
}

function onSvgLineLeave() {
  hoveredLine.value = -1;
  highlightBox.value = null;
}

defineExpose({ isSvg, svgDataUrl });
</script>

<template>
  <div v-if="isSvg && !fileLoading" class="svg-split">
    <div class="svg-preview" ref="svgPreviewRef">
      <img :src="svgDataUrl" alt="" class="svg-preview-img" />
      <div class="svg-hidden-render" v-html="fileContent"></div>
      <div
        v-if="highlightBox"
        class="svg-highlight"
        :style="{
          left: highlightBox.x + 'px',
          top: highlightBox.y + 'px',
          width: highlightBox.w + 'px',
          height: highlightBox.h + 'px',
        }"
      ></div>
    </div>
    <div class="svg-code">
      <pre><span
        v-for="(line, i) in svgLines"
        :key="i"
        class="svg-code-line"
        :class="{ 'svg-code-line-active': hoveredLine === i }"
        @mouseenter="onSvgLineHover(i)"
        @mouseleave="onSvgLineLeave"
      >{{ line }}
</span></pre>
    </div>
  </div>
  <div v-else class="file-viewer">
    <pre v-if="fileLoading">Loading file...</pre>
    <div v-else-if="isMarkdown" class="md-render" v-html="renderedMarkdown"></div>
    <pre v-else>{{ fileContent }}</pre>
  </div>
</template>

<style lang="css" scoped>
.file-viewer {
  padding: 12px;
  overflow: auto;
  flex: 1;
  background: #fff;
}

.file-viewer pre {
  margin: 0;
  color: #333;
  font-size: 12px;
  font-family: Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.svg-split {
  flex: 1;
  display: flex;
  min-height: 0;
}

.svg-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  overflow: auto;
  position: relative;
}

.svg-preview-img {
  max-width: 100%;
  max-height: 100%;
}

.svg-hidden-render {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

.svg-hidden-render :deep(svg) {
  width: 100%;
  height: 100%;
}

.svg-highlight {
  position: absolute;
  border: 2px solid red;
  pointer-events: none;
  border-radius: 1px;
}

.svg-code {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: #fff;
}

.svg-code-line {
  display: block;
  padding: 0 4px;
  cursor: pointer;
}

.svg-code-line:hover,
.svg-code-line-active {
  background: #e8f0fe;
}

.svg-code pre {
  margin: 0;
  color: #333;
  font-size: 12px;
  font-family: Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.svg-entry-icon {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  object-fit: contain;
}

.md-render {
  color: #333;
  font-size: 13px;
  line-height: 1.6;
  max-width: 800px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.md-render h1 { font-size: 1.8em; margin: 0.5em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
.md-render h2 { font-size: 1.4em; margin: 0.5em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
.md-render h3 { font-size: 1.2em; margin: 0.5em 0 0.3em; }
.md-render h4 { font-size: 1.05em; margin: 0.4em 0 0.2em; }

.md-render p { margin: 0.4em 0; }
.md-render ul { margin: 0.3em 0; padding-left: 24px; }
.md-render li { margin: 0.15em 0; }
.md-render hr { border: none; border-top: 1px solid #ddd; margin: 1em 0; }

.md-render code {
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

.md-render a { color: #0078d4; text-decoration: none; }
.md-render a:hover { text-decoration: underline; }
.md-render strong { font-weight: 600; }
</style>
