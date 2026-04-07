<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import conversations from "../data/conversations.json";
import { prUrl } from "../data/oss-repos";
import { fetchRepoInfo, sortedRepos } from "../data/oss-github-info";
import claudeIcon from "../assets/claude.svg";
import resumeIcon from "../assets/resume.svg";
import { essays } from "../data/essays";
import { entryLogos, halfSizeLogos, darkInvertLogos } from "../data/entry-logos";
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

const expandedRepos = ref<Set<string>>(new Set());
const showAllRepos = ref(false);
const activeSection = ref("about");
const activeSubSection = ref("");

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
    document.getElementById("readme-view")?.scrollTo({ top: 0, behavior: "instant" });
  }
}

let observer: IntersectionObserver | null = null;

const topLevelIds = ["about", "jobs", "projects", "oss", "essays"];

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

onMounted(async () => {
  fetchRepoInfo();
  await nextTick();
  scrollToCurrentHash();
  window.addEventListener("popstate", scrollToCurrentHash);

  const scrollRoot = document.getElementById("readme-view");
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const parent = subToParent.value[id];
          if (parent) {
            activeSection.value = parent;
            activeSubSection.value = id;
          } else {
            activeSection.value = id;
            activeSubSection.value = "";
          }
        }
      }
    },
    { root: scrollRoot, rootMargin: "0px 0px -60% 0px", threshold: 0 },
  );

  for (const id of topLevelIds) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  // Also observe all subheadings
  for (const id of Object.keys(subToParent.value)) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  window.removeEventListener("popstate", scrollToCurrentHash);
});
</script>

<template>
  <div id="readme-view" class="readme-view">
    <div class="readme-banner">
      <a href="/claude">Make it look like Claude <img :src="claudeIcon" class="claude-logo" aria-hidden="true" /></a>
      <button class="resume-banner-btn" @click="emit('print-resume')">
        <img :src="resumeIcon" class="resume-icon" aria-hidden="true" />
        Printable Resume
      </button>
    </div>

    <nav class="toc">
      <h2>Table of Contents</h2>
      <ul>
        <li v-for="entry in tocEntries" :key="entry.id">
          <a :href="`#${entry.id}`" :class="{ 'toc-active': activeSection === entry.id }">{{ entry.title }}</a>
          <ul v-if="entry.children && activeSection === entry.id" class="toc-sub">
            <li v-for="child in entry.children" :key="child.id">
              <a :href="`#${child.id}`" :class="{ 'toc-active': activeSubSection === child.id }">
                <img
                  v-if="entryLogos[child.id]"
                  :class="['toc-logo', { 'toc-logo--dark-invert': darkInvertLogos.has(child.id) }]"
                  :src="entryLogos[child.id]"
                  alt=""
                  aria-hidden="true"
                /><template v-for="(part, i) in splitTitleAtComma(child.title)" :key="i"><br v-if="i > 0" />{{ part }}</template>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="readme-body">
      <h1>Jason Lernerman's Portfolio</h1>

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
            >Penn State University ↗</a
          >! If my experience sounds like something you are hiring for or know
          someone who is hiring for, please
          <a
            href="https://www.linkedin.com/in/jason-lernerman/"
            target="_blank"
            rel="noopener noreferrer"
            >contact Jason ↗</a
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
            :class="['project-logo', { 'project-logo--half': halfSizeLogos.has(job.slug), 'project-logo--dark-invert': darkInvertLogos.has(job.slug) }]"
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
            :class="['project-logo', { 'project-logo--half': halfSizeLogos.has(project.slug), 'project-logo--dark-invert': darkInvertLogos.has(project.slug) }]"
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
              >{{ repo.name.split('/')[0] }}/<wbr>{{ repo.name.split('/')[1] }} ↗</a
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
                >{{ pr.description }} ↗</a
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
</template>

<style lang="css" scoped>
.readme-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  height: 100vh;
  height: 100dvh;
  width: 100%;
}


.readme-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 16px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
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
  padding: 2rem 1rem 4rem;
  box-sizing: border-box;
  overflow-wrap: break-word;
}

.readme-body h1 {
  font-size: 2rem;
  margin: 0 0 1.5rem;
  color: var(--text-bright);
}

.toc {
  margin: 1rem 1rem 2rem;
  padding: 1rem;
  background: var(--bg-raised);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

@media (min-width: 1025px) {
  .toc {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    left: 24px;
    width: 200px;
    margin: 0;
    z-index: 1;
  }
}

.toc h2 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: var(--text-muted);
}

.toc ul {
  margin: 0;
  padding-left: 1.25rem;
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
  position: relative;
}

.toc-logo {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  height: 14px;
  max-width: 16px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
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
  height: 28px;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.project-logo--half {
  height: 14px;
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
    left: calc(100% + 24px);
    margin-left: 0;
    transform: translateY(-50%);
    width: var(--logo-full-width);
    height: auto;
  }

  /* Half-size logos stay horizontally centered within the same right-margin
     range that a full-size logo would occupy. */
  .project-logo--half {
    width: calc(var(--logo-full-width) / 2);
    left: calc(100% + 24px + var(--logo-full-width) / 2);
    transform: translate(-50%, -50%);
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
  text-decoration: underline;
  text-underline-offset: 2px;
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
  text-decoration: underline;
  text-underline-offset: 2px;
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
}

.repo-header a:hover {
  text-decoration: underline;
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
}

.pr-list a:hover {
  color: var(--text-bright);
  text-decoration: underline;
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
