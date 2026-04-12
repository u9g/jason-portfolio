<script setup lang="ts">
import EntryLogo from "./shared/EntryLogo.vue";

interface TocEntry {
  id: string;
  title: string;
  children?: { id: string; title: string }[];
}

defineProps<{
  entries: TocEntry[];
  activeSection: string;
  activeSubSection: string;
  currentSectionLabel: string;
  currentSectionSlug: string;
  isDesktop: boolean;
}>();

const tocOpen = defineModel<boolean>("tocOpen", { required: true });

const emit = defineEmits<{ linkClick: [] }>();

function handleLinkClick() {
  tocOpen.value = false;
  emit("linkClick");
}

// Split a title like "Tool Name, Description" at the first comma so that
// the description always renders on its own line in the TOC sidebar.
function splitTitleAtComma(title: string): [string, string] | [string] {
  const idx = title.indexOf(", ");
  if (idx === -1) return [title];
  return [title.slice(0, idx + 1), title.slice(idx + 2)];
}
</script>

<template>
  <nav class="toc">
    <button
      type="button"
      class="toc-pill"
      :aria-expanded="tocOpen"
      @click="tocOpen = !tocOpen"
    >
      <span class="toc-pill-label">
        <EntryLogo
          v-if="currentSectionSlug"
          :slug="currentSectionSlug"
          class="toc-pill-logo"
        />
        <span>{{ currentSectionLabel }}</span>
      </span>
      <span class="toc-chevron" aria-hidden="true">▾</span>
    </button>
    <Transition name="toc-panel">
      <div v-if="isDesktop || tocOpen" class="toc-panel">
        <h2>Table of Contents</h2>
        <ul>
          <li v-for="entry in entries" :key="entry.id">
            <a
              :href="`#${entry.id}`"
              :class="{ 'toc-active': activeSection === entry.id }"
              @click="handleLinkClick"
              >{{ entry.title }}</a
            >
            <ul v-if="entry.children" class="toc-sub">
              <li v-for="child in entry.children" :key="child.id">
                <a
                  :href="`#${child.id}`"
                  :class="{ 'toc-active': activeSubSection === child.id }"
                  @click="handleLinkClick"
                >
                  <span class="toc-link-content">
                    <EntryLogo :slug="child.id" class="toc-logo" />
                    <span class="toc-link-label">
                      <template
                        v-if="isDesktop"
                        v-for="(part, i) in splitTitleAtComma(child.title)"
                        :key="i"
                        ><br v-if="i > 0" />{{ part }}</template
                      >
                      <template v-else>{{ child.title }}</template>
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style lang="css" scoped>
.toc {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  padding: 0.5rem 0;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.toc-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  /* At rest the pill is capped at a small max-width and centered. When
     .toc.stuck is applied the max-width grows to span the viewport,
     animating the pill from a centered chip into a full-bleed bar. */
  max-width: 380px;
  margin: 0 auto;
  padding: 0.7rem 1rem;
  background: var(--bg-raised);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-bright);
  font: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition:
    max-width 0.22s ease,
    margin 0.22s ease,
    border-radius 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.toc-pill-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-pill-label span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-pill-logo {
  flex-shrink: 0;
  width: auto;
  height: 14px;
  max-width: 16px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.toc-chevron {
  display: inline-block;
  color: var(--text-muted);
  transition: transform 0.18s ease;
  font-size: 0.85rem;
}

.toc-pill[aria-expanded="true"] .toc-chevron {
  transform: rotate(180deg);
}

.toc-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  width: 100%;
  max-width: 380px;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--bg-raised);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem 0.75rem;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition:
    max-width 0.22s ease,
    border-radius 0.22s ease;
}

.toc-panel-enter-active,
.toc-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  transform-origin: top center;
}

.toc-panel-enter-from,
.toc-panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scaleY(0.98);
}

.toc-panel h2 {
  display: block;
}

@media (min-width: 1025px) {
  .toc {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    left: 24px;
    width: 250px;
    margin: 0;
    z-index: 1;
    padding: 1rem;
    background: var(--bg-raised);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    max-height: 75vh;
    overflow-y: auto;
  }
  .toc-pill {
    display: none;
  }
  .toc-panel,
  .toc-panel-enter-active,
  .toc-panel-leave-active,
  .toc-panel-enter-from,
  .toc-panel-leave-to {
    position: static;
    transition: none;
    transform: none;
    opacity: 1;
  }
  .toc-panel {
    display: block;
    width: auto;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
    transition: none;
  }

  .toc-sub a {
    position: relative;
    display: inline-block;
  }

  .toc-link-content {
    display: inline;
  }

  .toc-logo {
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.toc h2 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: var(--text-muted);
}

.toc ul {
  margin: 0;
  padding-left: 0.95rem;
  list-style: none;
}

.toc li {
  margin: 0.3rem 0;
}

.toc a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
}

.toc a:hover {
  color: var(--text-bright);
  text-decoration: underline;
}

.toc a.toc-active {
  color: var(--text-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.toc ul ul {
  margin-top: 0.3rem;
}

.toc-sub {
  padding-left: 0.75rem;
}

.toc-sub a {
  display: inline-flex;
  align-items: flex-start;
}

.toc-logo {
  flex-shrink: 0;
  width: auto;
  height: 14px;
  max-width: 16px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.toc-link-content {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
}

.toc-link-label {
  min-width: 0;
}

.toc-sub a {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.toc-sub a:hover {
  color: var(--text-bright);
}

.toc-sub a.toc-active {
  color: var(--text-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
