<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import conversations from "../data/conversations.json";
import { prUrl } from "../data/oss-repos";
import { fetchRepoInfo, sortedRepos } from "../data/oss-github-info";
import claudeIcon from "../assets/claude.svg";
import resumeIcon from "../assets/resume.svg";
import Arrow from "./Arrow.vue";
import { essays } from "../data/essays";
import { entryLogos, darkInvertLogos } from "../data/entry-logos";
import { renderMessage } from "../data/render-markdown";

const emit = defineEmits<{ "print-resume": [] }>();

interface TocEntry {
  id: string;
  title: string;
  children?: { id: string; title: string }[];
}

const tocEntries = computed<TocEntry[]>(() => [
  { id: "about", title: "About Me" },
  {
    id: "jobs",
    title: "Job Experience",
    children: conversations.jobs.map((j) => ({ id: j.slug, title: j.title })),
  },
  {
    id: "projects",
    title: "Personal Projects",
    children: conversations.projects.map((p) => ({ id: p.slug, title: p.title })),
  },
  { id: "oss", title: "Notable OSS Contributions" },
  {
    id: "essays",
    title: "Essays",
    children: essays.map((e) => ({ id: e.slug, title: e.title })),
  },
]);

// All TOC child entries that have a registered logo, in the order they appear
// in the table of contents. Used to render the logo strip beside the page title.
const tocLogoEntries = computed(() =>
  tocEntries.value.flatMap((entry) =>
    (entry.children ?? [])
      .filter((child) => entryLogos[child.id])
      .map((child) => ({ id: child.id, title: child.title, logo: entryLogos[child.id] })),
  ),
);

const expandedRepos = ref<Set<string>>(new Set());
const showAllRepos = ref(false);
const activeSection = ref("about");
const activeSubSection = ref("");
const tocOpen = ref(false);
const isDesktop = ref(false);

const currentSectionLabel = computed(() => {
  const subId = activeSubSection.value;
  const secId = activeSection.value;
  for (const entry of tocEntries.value) {
    if (subId && entry.children) {
      const child = entry.children.find((c) => c.id === subId);
      if (child) return `${entry.title} / ${child.title}`;
    }
    if (entry.id === secId && !subId) return entry.title;
  }
  return "Table of Contents";
});

const currentSectionLogo = computed(() => {
  const subId = activeSubSection.value;
  return subId ? entryLogos[subId] ?? null : null;
});

function handleTocLinkClick() {
  tocOpen.value = false;
}

function handleOutsideClick(e: MouseEvent) {
  if (!tocOpen.value) return;
  const target = e.target as Element | null;
  // The pill may be teleported out of .toc into .readme-pill-slot when
  // stuck, so allow clicks inside either the pill or the .toc panel.
  if (target && !target.closest(".toc, .toc-pill")) {
    tocOpen.value = false;
  }
}

function copyAnchor(id: string) {
  window.location.hash = id;
}

// Split a title like "Tool Name, Description" at the first comma so that
// the description always renders on its own line in the TOC sidebar.
function splitTitleAtComma(title: string): [string, string] | [string] {
  const idx = title.indexOf(", ");
  if (idx === -1) return [title];
  return [title.slice(0, idx + 1), title.slice(idx + 2)];
}

// Scroll the readme-view container to the current location.hash target.
// Browsers natively scroll on anchor clicks but not on back/forward popstate
// when the scroll container is not the document, so we have to do it ourselves.
function scrollToCurrentHash() {
  const hash = window.location.hash;
  if (hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: "instant" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

let desktopMediaQuery: MediaQueryList | null = null;
let handleDesktopMediaChange: ((e: MediaQueryListEvent) => void) | null = null;

// Map subheading IDs to their parent section ID
const subToParent = computed(() => {
  const map: Record<string, string> = {};
  for (const entry of tocEntries.value) {
    if (entry.children) {
      for (const child of entry.children) {
        map[child.id] = entry.id;
      }
    }
  }
  return map;
});

function stickyBottom(): number {
  if (isDesktop.value) return 0;
  const tocBottom = document.querySelector(".toc")?.getBoundingClientRect().bottom ?? 0;
  const bannerBottom = document.querySelector(".readme-banner")?.getBoundingClientRect().bottom ?? 0;
  return Math.max(tocBottom, bannerBottom);
}

function updateActiveHeading() {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(".section-header, .sub-header, .repo-header"),
  ).filter((el) => el.id);
  if (headings.length === 0) return;

  const cutoff = stickyBottom();
  const firstVisible =
    headings.find((el) => el.getBoundingClientRect().bottom > cutoff) ??
    headings[headings.length - 1];

  const bestId = firstVisible.id;
  const parent = subToParent.value[bestId];
  if (parent) {
    activeSection.value = parent;
    activeSubSection.value = bestId;
  } else {
    activeSection.value = bestId;
    activeSubSection.value = "";
  }
}

onMounted(async () => {
  fetchRepoInfo();
  await nextTick();
  desktopMediaQuery = window.matchMedia("(min-width: 1025px)");
  isDesktop.value = desktopMediaQuery.matches;
  handleDesktopMediaChange = (e) => {
    isDesktop.value = e.matches;
    updateActiveHeading();
  };
  desktopMediaQuery.addEventListener("change", handleDesktopMediaChange);
  scrollToCurrentHash();
  window.addEventListener("popstate", scrollToCurrentHash);
  window.addEventListener("scroll", updateActiveHeading, { passive: true });
  window.addEventListener("resize", updateActiveHeading);
  document.addEventListener("click", handleOutsideClick);
  updateActiveHeading();
});

// Keep the active TOC entry in view as the user scrolls the page. We adjust
// the TOC's own scrollTop manually instead of using scrollIntoView so that
// only the TOC scrolls — never the document. The first/last links snap to
// the absolute top/bottom so the "Table of Contents" heading and the toc's
// trailing padding remain reachable.
watch([activeSection, activeSubSection], () => {
  const id = activeSubSection.value || activeSection.value;
  if (!id) return;
  // On desktop the .toc element itself is the scroll container; on mobile
  // it's the .toc-panel inside. Pick whichever actually owns the overflow.
  const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
  const toc = (isDesktop
    ? document.querySelector(".toc")
    : document.querySelector(".toc-panel")) as HTMLElement | null;
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll<HTMLElement>('a[href^="#"]'));
  const idx = links.findIndex((a) => a.getAttribute("href") === `#${id}`);
  if (idx === -1) return;
  const max = toc.scrollHeight - toc.clientHeight;
  if (idx === 0) {
    toc.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (idx === links.length - 1) {
    toc.scrollTo({ top: max, behavior: "smooth" });
    return;
  }
  const link = links[idx];
  const linkTop = link.offsetTop;
  const linkBottom = linkTop + link.offsetHeight;
  const pad = 12;
  if (linkTop < toc.scrollTop + pad) {
    toc.scrollTo({ top: Math.max(0, linkTop - pad), behavior: "smooth" });
  } else if (linkBottom > toc.scrollTop + toc.clientHeight - pad) {
    toc.scrollTo({ top: Math.min(max, linkBottom - toc.clientHeight + pad), behavior: "smooth" });
  }
});

onUnmounted(() => {
  if (desktopMediaQuery && handleDesktopMediaChange) {
    desktopMediaQuery.removeEventListener("change", handleDesktopMediaChange);
  }
  window.removeEventListener("popstate", scrollToCurrentHash);
  window.removeEventListener("scroll", updateActiveHeading);
  window.removeEventListener("resize", updateActiveHeading);
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <div class="readme-shell">
  <div id="readme-view" class="readme-view">
    <nav class="toc">
        <button
          type="button"
          class="toc-pill"
          :aria-expanded="tocOpen"
          @click="tocOpen = !tocOpen"
        >
          <span class="toc-pill-label">
            <img
              v-if="currentSectionLogo"
              :src="currentSectionLogo"
              class="toc-pill-logo"
              alt=""
              aria-hidden="true"
            />
            <span>{{ currentSectionLabel }}</span>
          </span>
          <span class="toc-chevron" aria-hidden="true">▾</span>
        </button>
        <Transition name="toc-panel">
        <div v-if="isDesktop || tocOpen" class="toc-panel">
          <h2>Table of Contents</h2>
          <ul>
            <li v-for="entry in tocEntries" :key="entry.id">
              <a
                :href="`#${entry.id}`"
                :class="{ 'toc-active': activeSection === entry.id }"
                @click="handleTocLinkClick"
                >{{ entry.title }}</a
              >
              <ul v-if="entry.children" class="toc-sub">
                <li v-for="child in entry.children" :key="child.id">
                  <a
                    :href="`#${child.id}`"
                    :class="{ 'toc-active': activeSubSection === child.id }"
                    @click="handleTocLinkClick"
                  >
                    <span class="toc-link-content">
                      <img
                        v-if="entryLogos[child.id]"
                        :class="['toc-logo', { 'toc-logo--dark-invert': darkInvertLogos.has(child.id) }]"
                        :src="entryLogos[child.id]"
                        alt=""
                        aria-hidden="true"
                      />
                      <span class="toc-link-label">
                        <template v-if="isDesktop" v-for="(part, i) in splitTitleAtComma(child.title)" :key="i"><br v-if="i > 0" />{{ part }}</template>
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

    <div class="readme-banner">
      <a href="/claude">Make it look like Claude <img :src="claudeIcon" class="claude-logo" aria-hidden="true" /></a>
      <button class="resume-banner-btn" @click="emit('print-resume')">
        <img :src="resumeIcon" class="resume-icon" aria-hidden="true" />
        Printable Resume
      </button>
    </div>

    <div class="readme-body">
      <div class="title-row">
        <h1>Jason Lernerman's Portfolio</h1>
        <div class="title-logos">
          <a
            v-for="item in tocLogoEntries"
            :key="item.id"
            :href="`#${item.id}`"
            :title="item.title"
            :aria-label="item.title"
            class="title-logo"
          >
            <img
              :src="item.logo"
              :class="{ 'title-logo--dark-invert': darkInvertLogos.has(item.id) }"
              :alt="item.title"
            />
          </a>
        </div>
      </div>
      <!-- About -->
      <h2
        id="about"
        :class="['section-header', { active: activeSection === 'about' }]"
        @click="copyAnchor('about')"
      >
        <span class="anchor-icon">#</span> About Me
      </h2>
      <div class="section-content about-prose">
        <p>Hi, my name is Jason and I have been programming for a while.</p>
        <p>
          I've worked on a lot of fun and interesting projects, as you will see
          if you read on, and have now graduated from
          <a
            href="https://www.psu.edu"
            target="_blank"
            rel="noopener noreferrer"
            >Penn State University <Arrow /></a
          >! If my experience sounds like something you are hiring for or know
          someone who is hiring for, please
          <a
            href="https://www.linkedin.com/in/jason-lernerman/"
            target="_blank"
            rel="noopener noreferrer"
            >contact Jason <Arrow /></a
          >!
        </p>
      </div>
      <!-- Job Experience -->
      <h2 id="jobs" :class="['section-header', { active: activeSection === 'jobs' }]" @click="copyAnchor('jobs')">
        <span class="anchor-icon">#</span> Job Experience
      </h2>
      <div
        v-for="job in conversations.jobs"
        :key="job.slug"
        class="section-content"
      >
        <h3
          :id="job.slug"
          :class="['sub-header', { active: activeSubSection === job.slug }]"
          @click="copyAnchor(job.slug)"
        >
          <span class="anchor-icon">#</span> {{ job.title }}
          <img
            v-if="entryLogos[job.slug]"
            :class="['project-logo', { 'project-logo--dark-invert': darkInvertLogos.has(job.slug) }]"
            :src="entryLogos[job.slug]"
            :alt="`${job.title} logo`"
          />
        </h3>
        <div
          v-for="(msg, i) in job.conversation"
          :key="i"
          :class="['qa-pair', msg.role]"
        >
          <p v-if="msg.role === 'user'" class="question">{{ msg.message }}</p>
          <p v-else class="answer" v-html="renderMessage(msg.message)"></p>
        </div>
      </div>
      <!-- Personal Projects -->
      <h2
        id="projects"
        :class="['section-header', { active: activeSection === 'projects' }]"
        @click="copyAnchor('projects')"
      >
        <span class="anchor-icon">#</span> Personal Projects
      </h2>
      <div
        v-for="project in conversations.projects"
        :key="project.slug"
        class="section-content"
      >
        <h3
          :id="project.slug"
          :class="['sub-header', { active: activeSubSection === project.slug }]"
          @click="copyAnchor(project.slug)"
        >
          <span class="anchor-icon">#</span> {{ project.title }}
          <img
            v-if="entryLogos[project.slug]"
            :class="['project-logo', { 'project-logo--dark-invert': darkInvertLogos.has(project.slug) }]"
            :src="entryLogos[project.slug]"
            :alt="`${project.title} logo`"
          />
        </h3>
        <div
          v-for="(msg, i) in project.conversation"
          :key="i"
          :class="['qa-pair', msg.role]"
        >
          <p v-if="msg.role === 'user'" class="question">{{ msg.message }}</p>
          <p v-else class="answer" v-html="renderMessage(msg.message)"></p>
        </div>
      </div>
      <!-- OSS Contributions -->
      <h2 id="oss" :class="['section-header', { active: activeSection === 'oss' }]" @click="copyAnchor('oss')">
        <span class="anchor-icon">#</span> Notable OSS Contributions
      </h2>
      <div class="section-content">
        <div v-for="repo in (showAllRepos ? sortedRepos : sortedRepos.slice(0, 5))" :key="repo.name" class="oss-repo">
          <h3
            :id="`oss-${repo.name.replace('/', '-')}`"
            :class="['repo-header', { active: activeSubSection === `oss-${repo.name.replace('/', '-')}` }]"
            @click="copyAnchor(`oss-${repo.name.replace('/', '-')}`)"
          >
            <span class="anchor-icon">#</span>
            <span class="lang-dot" :style="{ background: repo.color }"></span>
            <a
              :href="`https://github.com/${repo.name}`"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >{{ repo.name.split('/')[0] }}/<wbr>{{ repo.name.split('/')[1] }} <Arrow /></a
            >
            <button
              class="expand-btn"
              @click.stop="
                expandedRepos.has(repo.name)
                  ? expandedRepos.delete(repo.name)
                  : expandedRepos.add(repo.name)
              "
            >
              {{ expandedRepos.has(repo.name) ? "−" : "+" }}
            </button>
            <span class="lang-label" :style="{ color: repo.color }">{{
              repo.lang
            }}</span>
          </h3>
          <ul v-if="expandedRepos.has(repo.name)" class="pr-list">
            <li v-for="pr in repo.prs" :key="pr.id">
              <a
                :href="prUrl(repo.name, pr.id)"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
                >{{ pr.description }} <Arrow /></a
              >
            </li>
          </ul>
        </div>
        <button v-if="!showAllRepos && sortedRepos.length > 5" class="show-all-btn" @click="showAllRepos = true">
          Show {{ sortedRepos.length - 5 }} more repos
        </button>
        <button v-else-if="showAllRepos && sortedRepos.length > 5" class="show-all-btn" @click="showAllRepos = false">
          Show less
        </button>
      </div>
      <!-- Essays -->
      <h2 id="essays" :class="['section-header', { active: activeSection === 'essays' }]" @click="copyAnchor('essays')">
        <span class="anchor-icon">#</span> Essays
      </h2>
      <div class="section-content about-prose">
        <template v-for="essay in essays" :key="essay.slug">
          <h3
            :id="essay.slug"
            :class="['sub-header', { active: activeSubSection === essay.slug }]"
            @click="copyAnchor(essay.slug)"
          >
            <span class="anchor-icon">#</span> {{ essay.title }} <span class="essay-date">{{ essay.date }}</span>
          </h3>
          <template v-for="(block, i) in essay.blocks" :key="i">
            <p v-if="block.type === 'p'" v-html="renderMessage(block.text)"></p>
            <li v-else-if="block.type === 'li'" class="essay-li" v-html="renderMessage(block.text)"></li>
          </template>
        </template>
      </div>
    </div>
  </div>
  </div>
</template>

<style lang="css" scoped>
.readme-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.readme-view {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
}


.readme-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  padding: 8px 16px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
  box-sizing: border-box;
}

.resume-banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid var(--text-muted);
  padding: 0 0 1px;
  border-radius: 0;
}

.resume-banner-btn:hover {
  color: var(--text-bright);
  border-bottom-color: var(--text-bright);
}

.resume-icon {
  width: 0.75rem;
  height: 0.75rem;
  filter: brightness(0) invert(0.75);
}

:root[data-theme="light"] .resume-icon {
  filter: brightness(0) invert(0.35);
}

.readme-banner a {
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 1px solid var(--text-muted);
  padding-bottom: 1px;
}

.readme-banner a:hover {
  color: var(--text-bright);
  border-bottom-color: var(--text-bright);
}

.claude-logo {
  width: 0.75rem;
  height: 0.75rem;
  vertical-align: middle;
  margin-left: 2px;
}

.readme-body {
  max-width: 724px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem 4rem;
  box-sizing: border-box;
  overflow-wrap: break-word;
}

.readme-body h1 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-bright);
}

.title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin: 1.5rem 0 1.5rem;
}

.title-logos {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.title-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: transform 0.12s ease, opacity 0.12s ease;
  opacity: 0.85;
}

.title-logo:hover {
  transform: translateY(-1px);
  opacity: 1;
}

.title-logo img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

:root[data-theme="dark"] .title-logo img.title-logo--dark-invert {
  filter: invert(1);
}

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
  transition: max-width 0.22s ease, margin 0.22s ease,
    border-radius 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
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
  transition: max-width 0.22s ease, border-radius 0.22s ease;
}

.toc-panel-enter-active,
.toc-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
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
  /* On desktop the .toc element itself is the visible box, exactly as it
     was before the mobile pill redesign — fixed to the left rail with its
     own padding/border/background. The inner .toc-panel becomes an
     unstyled passthrough so the box-sizing/width/transition baked into
     its base styles for the mobile dropdown can't leak in here. */
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

  /* Keep the mobile flex layout scoped away from desktop so logos stay
     centered in the left gutter beside multi-line entry labels. */
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

@media (max-width: 1024px) {
  .section-header,
  .sub-header {
    scroll-margin-top: 76px;
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

:root[data-theme="dark"] .toc-logo--dark-invert,
:root[data-theme="dark"] .project-logo--dark-invert {
  filter: invert(1);
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

.section-header {
  font-size: 1.3rem;
  margin: 2.5rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-bright);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header:hover .anchor-icon,
.section-header.active .anchor-icon {
  opacity: 1;
}

.anchor-icon {
  opacity: 0;
  color: var(--text-dim);
  font-size: 0.9em;
  transition: opacity 0.15s;
  user-select: none;
}

.section-content {
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.7;
  position: relative;
}

.sub-header {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.5rem;
  color: var(--text-bright);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-header:hover .anchor-icon,
.sub-header.active .anchor-icon {
  opacity: 1;
}

.project-logo {
  margin-left: auto;
  width: auto;
  height: 14px;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* When the viewport is wide enough that the readme body has real margin
   space on its right, lock the logo into that right margin and center it
   vertically against the entire QnA block (its containing section-content).
   The width fills the available gap between the text column and the
   scrollbar — capped so it never grows obnoxiously large on huge monitors.

   Math: .readme-body is centered with max-width 724px (border-box, 16px
   horizontal padding → 692px inner). The right edge of .section-content is
   at viewport_center + 346px. With `left: calc(100% + 24px)` the logo's
   left edge sits at viewport_center + 370px. Reserving ~24px of right
   padding and ~16px for the scrollbar leaves
   `viewport_width - 40 - (viewport_center + 370) = 50vw - 410px`
   of horizontal room. */
@media (min-width: 1025px) {
  .project-logo {
    --logo-full-width: min(calc(50vw - 410px), 360px);
    position: absolute;
    top: 50%;
    left: calc(100% + 24px + var(--logo-full-width) / 2);
    margin-left: 0;
    transform: translate(-50%, -50%);
    width: calc(var(--logo-full-width) / 2);
    height: auto;
  }
}

.essay-date {
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--text-dim);
}

.essay-li {
  margin: 0 0 0.5rem;
  padding-left: 40px;
  list-style-position: inside;
}

.about-prose p {
  margin: 0 0 1.25rem;
  padding-left: 40px;
}

.about-prose a,
.about-prose :deep(a) {
  color: var(--text-bright);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.about-prose a:hover,
.about-prose :deep(a:hover) {
  color: var(--text-muted);
}

.about-prose em,
.about-prose :deep(em) {
  font-family: "Playfair Display", serif;
  font-style: italic;
  color: var(--text-bright);
}

.question {
  font-weight: 500;
  color: var(--text-bright);
  margin: 1rem 0 0.25rem;
  padding-left: 40px;
}

.answer {
  color: var(--text-muted);
  margin: 0 0 0.75rem;
  padding-left: 40px;
}

.answer :deep(a) {
  color: var(--text-bright);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.answer :deep(a:hover) {
  color: var(--text-muted);
}

.answer :deep(code) {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85em;
  background: var(--bg-hover);
  color: var(--text-bright);
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.oss-repo {
  margin-bottom: 1.25rem;
}

.repo-header {
  font-size: 1rem;
  margin: 1rem 0 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-bright);
}

.repo-header:hover .anchor-icon,
.repo-header.active .anchor-icon {
  opacity: 1;
}

.repo-header a {
  color: var(--text-bright);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
}

.repo-header a:hover {
  border-bottom-color: currentColor;
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lang-label {
  font-size: 0.7rem;
  font-weight: 300;
  margin-left: auto;
}

.pr-list {
  margin: 0;
  padding-left: 1.5rem;
}

.pr-list li {
  margin: 0.2rem 0;
  font-size: 0.82rem;
}

.pr-list a {
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
}

.pr-list a:hover {
  color: var(--text-bright);
  border-bottom-color: currentColor;
}

.expand-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.2rem;
  font-family: inherit;
  padding: 0 6px;
  line-height: 1;
}

.expand-btn:hover {
  color: var(--text-bright);
}

.show-all-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  padding: 8px 40px;
}

.show-all-btn:hover {
  color: var(--text-bright);
}
</style>
