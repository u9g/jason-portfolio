<script setup lang="ts">
import { entryLogos, darkInvertLogos } from "../../data/entry-logos";

defineProps<{ slug: string; alt?: string }>();
</script>

<template>
  <img
    v-if="entryLogos[slug]"
    :src="entryLogos[slug]"
    :class="{ 'entry-logo--dark-invert': darkInvertLogos.has(slug) }"
    :alt="alt ?? ''"
    :aria-hidden="alt ? undefined : 'true'"
  />
</template>

<style scoped>
:root[data-theme="dark"] .entry-logo--dark-invert {
  filter: invert(1);
}
</style>
