<script setup lang="ts">
import contactIcon from "../assets/contact.svg";
import diceIcon from "../assets/dice.svg";
import SidebarButton from "./SidebarButton.vue";
import ShareButton from "./ShareButton.vue";
import Arrow from "./Arrow.vue";
import conversations from "../data/conversations.json";
import { essays } from "../data/essays";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: []; navigate: [slug: string] }>();

const allSlugs = [
  "oss",
  ...conversations.jobs.map((j) => j.slug),
  ...conversations.projects.map((p) => p.slug),
  ...essays.map((e) => e.slug),
];

function goRandom() {
  const slug = allSlugs[Math.floor(Math.random() * allSlugs.length)];
  emit("navigate", slug);
}
</script>

<template>
  <div class="conversation">
    <div class="top-bar">
      <button
        v-if="sidebarCollapsed"
        class="sidebar-toggle"
        @click="emit('toggleSidebar')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"
          ></path>
        </svg>
      </button>
      About Jason
      <ShareButton />
    </div>
    <div class="about-content">
      <p>
        Hi, my name is Jason and I have been programming for a while.
      </p>
      <p>
        I've worked on a lot of fun and interesting projects, as you will see if
        you read on, and have now graduated from
        <a
          href="https://www.psu.edu"
          target="_blank"
          rel="noopener noreferrer"
          >Penn State University <Arrow /></a
        >! If my experience sounds like something you are hiring for or know
        someone who is hiring for, please
        <SidebarButton
          :icon="contactIcon"
          label="Contact Jason"
          href="https://www.linkedin.com/in/jason-lernerman/"
          :collapsed="false"
          class="inline-contact-btn"
        />
        !
      </p>
      <p>
        To read on, take a look at the articles on the sidebar, or
        <button class="inline-btn" @click="goRandom">
          <span class="icon-circle">
            <img :src="diceIcon" />
          </span>
          <span>Take me somewhere random</span>
        </button>
        !
      </p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 56px;
  position: sticky;
  top: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-base);
  z-index: 1;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0;
  color: var(--text-muted);
}

.sidebar-toggle:hover {
  background: var(--bg-hover);
}

@media (min-width: 1025px) {
  .sidebar-toggle {
    display: none;
  }
}

.about-content p {
  margin: 0;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 300;
}

.about-content a {
  text-decoration: none;
  color: var(--text-bright);
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.inline-contact-btn {
  display: inline-flex !important;
  width: auto !important;
  vertical-align: -2px;
  border: 0.5px solid var(--text-dim) !important;
  border-radius: 6px !important;
  margin-top: 4px;
  height: 24px !important;
  font-size: 0.75rem !important;
  padding: 2px 8px 2px 4px !important;
  gap: 0.35rem !important;
}

.inline-contact-btn :deep(.icon-circle) {
  width: 16px;
  height: 16px;
}

.inline-contact-btn :deep(.icon-circle img) {
  width: 10px;
  height: 10px;
}

.inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  vertical-align: -2px;
  border: 0.5px solid var(--text-dim);
  border-radius: 6px;
  margin-top: 4px;
  height: 24px;
  font-size: 0.75rem;
  font-family: inherit;
  padding: 2px 8px 2px 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.inline-btn:hover {
  background: var(--bg-hover);
  color: var(--text-bright);
}

.inline-btn .icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--bg-icon);
  flex-shrink: 0;
}

.inline-btn .icon-circle img {
  width: 10px;
  height: 10px;
  filter: brightness(0) invert(0.75);
}

:root[data-theme="light"] .inline-btn .icon-circle img {
  filter: brightness(0) invert(0.35);
}
</style>
