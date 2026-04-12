<script setup lang="ts">
import { computed, ref } from "vue";
import { rawUrl } from "./helpers";
import MarkdownRender from "./MarkdownRender.vue";

const props = defineProps<{
  fileName: string;
  fileContent: string;
  fileLoading: boolean;
  currentRepo: string;
}>();

const isMarkdown = computed(() => props.fileName.endsWith(".md"));
const mdBaseUrl = computed(() => {
  const parts = props.fileName.includes("/") ? props.fileName.split("/").slice(0, -1).join("/") + "/" : "";
  return rawUrl(parts, props.currentRepo);
});

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
    <MarkdownRender v-else-if="isMarkdown" :source="fileContent" :base-url="mdBaseUrl" />
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

</style>
