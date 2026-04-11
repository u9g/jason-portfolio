<script setup lang="ts">
// .trim() strips the file's trailing newline so v-html doesn't render it
// as a stray whitespace character after the SVG inside the wrapper span.
import arrowSvgRaw from "../../assets/arrow.svg?raw";
const arrowSvg = arrowSvgRaw.trim();
</script>

<template>
  <span class="arrow" v-html="arrowSvg"></span>
</template>
