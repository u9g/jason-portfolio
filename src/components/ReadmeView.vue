<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import conversations from "../data/conversations.json";
import { techColors } from "../data/tech-colors";
import { prUrl } from "../data/oss-repos";
import { fetchRepoInfo, sortedRepos } from "../data/oss-github-info";
import claudeIcon from "../assets/claude.svg";

const langPattern = new RegExp(
  `\\b(${Object.keys(techColors)
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "g",
);

function formatMessage(text: string): string {
  let result = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>',
  );
  result = result.replace(langPattern, (match) => {
    const color = techColors[match];
    return `<span style="color: ${color}">${match}</span>`;
  });
  return result;
}

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
    children: [
      { id: "", title: "" },
      { id: "how-i-started", title: "How I Started Programming" },
    ],
  },
]);

const expandedRepos = ref<Set<string>>(new Set());
const activeSection = ref("about");
const activeSubSection = ref("");

function copyAnchor(id: string) {
  window.location.hash = id;
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
  const hash = window.location.hash;
  if (hash.length > 1) {
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

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
});
</script>

<template>
  <div id="readme-view" class="readme-view">
    <div class="readme-banner">
      <a href="/claude">Make it look like Claude <img :src="claudeIcon" class="claude-logo" aria-hidden="true" /></a>
    </div>

    <nav class="toc">
      <h2>Table of Contents</h2>
      <ul>
        <li v-for="entry in tocEntries" :key="entry.id">
          <a :href="`#${entry.id}`" :class="{ 'toc-active': activeSection === entry.id }">{{ entry.title }}</a>
          <ul v-if="entry.children && activeSection === entry.id" class="toc-sub">
            <li v-for="child in entry.children" :key="child.id">
              <a :href="`#${child.id}`" :class="{ 'toc-active': activeSubSection === child.id }">{{ child.title }}</a>
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
        </h3>
        <div
          v-for="(msg, i) in job.conversation"
          :key="i"
          :class="['qa-pair', msg.role]"
        >
          <p v-if="msg.role === 'user'" class="question">{{ msg.message }}</p>
          <p v-else class="answer" v-html="formatMessage(msg.message)"></p>
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
        </h3>
        <div
          v-for="(msg, i) in project.conversation"
          :key="i"
          :class="['qa-pair', msg.role]"
        >
          <p v-if="msg.role === 'user'" class="question">{{ msg.message }}</p>
          <p v-else class="answer" v-html="formatMessage(msg.message)"></p>
        </div>
      </div>

      <!-- OSS Contributions -->
      <h2 id="oss" :class="['section-header', { active: activeSection === 'oss' }]" @click="copyAnchor('oss')">
        <span class="anchor-icon">#</span> Notable OSS Contributions
      </h2>
      <div class="section-content">
        <div v-for="repo in sortedRepos" :key="repo.name" class="oss-repo">
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
      </div>

      <!-- Essays -->
      <h2 id="essays" :class="['section-header', { active: activeSection === 'essays' }]" @click="copyAnchor('essays')">
        <span class="anchor-icon">#</span> Essays
      </h2>
      <div class="section-content about-prose">
        <h3
          id=""
          :class="['sub-header', { active: activeSubSection === '' }]"
          @click="copyAnchor('')"
        >
          <span class="anchor-icon">#</span>  <span class="essay-date">March 22, 2026</span>
        </h3>
        <p>One of the largest value creation events has been Claude code's popularization of the $20 / $100 / $200 per month subscriptions for an almost endless supply of staff software engineer level contributions to a codebase, available on tap. To act as if that isn't true is to act as if the creation of software wasn't bottlenecked by the pipe size. I don't believe this to be true because for the longest time, the actual largest barrier on the widespread creation of software has been how quickly can idea guys get their ideas down on paper before the idea fades. To say this isn't so is to act as though execution speed is not directly proportional to opportunity test speed.</p>
        <p>Yes, your existing enterprise applications of code are indeed bottlenecked by the slow death of scattered task requirements split amongst non-easily-accessable tools which are of course not machine-interactable. However, I am not talking about the enterprise use case when I make this statement. I am talking to the multitude of people that are now happily using coding tools to build every idea that pops into their mind for no reason other than that it is now possible. And in my eyes, that is beautiful.</p>
        <p>For a while, I wasn't a believer. I'd seen many different AI models come and go and had become fatigued by the seemingly endless barrage of "innovations" that amounted to nothing more than some numbers going up, numbers that meant zip to me. However, recently, I interviewed with a company, and one of their interview rounds they set me up with a codebase that they had prepared ahead of time with some bugs and a backlog of features, and told me that I had the next ninety minutes to fix up the app as much as I could, and to act as if there was a demo in 90 minutes of the application using AI tools, as their VP of engineering and a staff engineer would watch my performance.</p>
        <p>The interviewer then spent the next 11 minutes trying to figure out how to send me a 1.5gb zip file, a problem that the VP of engineering had not thought of until that exact moment. I half-in-jest suggested that he just ask Claude, and he agreed and started that up. I then asked him if there were node_modules in that zip, an answer which I'm sure will shock noone, as he said there were.</p>
        <p>Regardless, I finally got the project running on my machine and started up Claude Code and started firing on all cylinders. After those 90 minutes, I felt a feeling similar to when I would push myself to prepare for a class's final exam for the weekend before finals, that is, I felt as though I really enjoyed doing this, I just wish I had more time to. So even though I walked out of that interview without getting the job, I left with a new appreciation of Claude Code and how thoroughly capable it really was at this point in time.</p>
        <p>The next thing I did was build my portfolio website, jasonlernerman.com in the design of Claude's web ui, having been inspired by various websites that clone Google's UIs for a different use case. While working on the site, I felt something I hadn't felt with programming in a while. I felt the possibility returning to my fingertips. Even though I had little to no CSS chops, that had no bearing on my ability to build a beautiful (in my eyes) website as soon as I could put the words down into Claude Code.</p>
        <p>As a takeaway, I would say that I never would have known the ability of Claude Code without that interview, and I would liken this to many stories I've heard of people being pushed in the deep end and told that this was the only option, and them coming out of the experience with a newfound ability to perform that they hadn't known they had within them prior. I really do feel like doors are opening for the curious in the programming world, if you really go in open-minded.</p>
        <p><em>And yes, I did write this (without AI) while waiting for a Claude Code prompt to complete.</em></p>
        <h3
          id="how-i-started"
          :class="['sub-header', { active: activeSubSection === 'how-i-started' }]"
          @click="copyAnchor('how-i-started')"
        >
          <span class="anchor-icon">#</span> How I Started Programming <span class="essay-date">March 19, 2026</span>
        </h3>
        <p>
          Since way back in senior year of highschool, when I decided I would
          learn JavaScript to
          <a
            href="https://github.com/PrismarineJS/mineflayer"
            target="_blank"
            rel="noopener noreferrer"
            >make a minecraft bot ↗</a
          >. Then I learned TypeScript so I could
          <a
            href="https://github.com/u9g/minecraft-proxy-handler/commit/6caa09e3fbcbcf3b0e5d96054e4ff46561d4233f"
            target="_blank"
            rel="noopener noreferrer"
            >make APIs ↗</a
          >
          for myself and others. Around the same time I also started learning
          Java because if you're already making minecraft bots you may as well
          start
          <a
            href="https://github.com/u9g/ReverseHopper/commit/36300a67a2ecb2400e9fd300634fc91b3e2434bd"
            target="_blank"
            rel="noopener noreferrer"
            >making minecraft mods ↗</a
          >
          and
          <a
            href="https://github.com/u9g/McDataExtracting/commit/2e68722a6afb4366bd1fdb0f12fb8afa127f9fef"
            target="_blank"
            rel="noopener noreferrer"
            >contributing to Java tools ↗</a
          >
          for JavaScript minecraft bots. Since then, I learned Kotlin, which is
          the TypeScript to JavaScript in the Java world, and continued making
          <a
            href="https://github.com/u9g/cosmicsky-client"
            target="_blank"
            rel="noopener noreferrer"
            >minecraft mods ↗</a
          >
          and
          <a
            href="https://github.com/u9g/Minigames"
            target="_blank"
            rel="noopener noreferrer"
            >minecraft plugins ↗</a
          >. Around this time, I took a look around the programming landscape
          and tried out Gleam, which is a growing programming language that
          compiles to Erlang, or in my use case JavaScript, for
          <a
            href="https://github.com/u9g/thatgleammod"
            target="_blank"
            rel="noopener noreferrer"
            >more minecraft mods ↗</a
          >.
        </p>
        <p>
          After that, I started looking into other things which I found
          interesting, like data presentation formats and databases and stumbled
          upon Trustfall. Trustfall is, according to the github README,
          <em
            >"A query engine for any combination of data sources. Query your
            files and APIs as if they were databases!"</em
          >. And that's what I did for a while, until I wanted to expand the
          project even more, being a programmer myself, I created a
          <a
            href="https://github.com/u9g/github_adapter"
            target="_blank"
            rel="noopener noreferrer"
            >github adapter ↗</a
          >
          and
          <a
            href="https://github.com/obi1kenobi/trustfall/commits?author=u9g"
            target="_blank"
            rel="noopener noreferrer"
            >contributed back to the original project ↗</a
          >
          under the guidance of the extremely patient and helpful maintainer.
        </p>
        <p>
          Later, I took my Rust knowledge on the road when I got interested in
          learning about linters and a brand new project at that time, OXC,
          which describes itself as,
          <em>"A collection of high-performance JavaScript tools."</em>. I found
          this premise interesting, and I also found Rust to be a great language
          for new contributors to a project, so I
          <a
            href="https://github.com/oxc-project/oxc/commits?author=u9g"
            target="_blank"
            rel="noopener noreferrer"
            >spent a good amount of time contributing to this project too ↗</a
          >.
        </p>
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
  padding: 8px 16px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
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

.essay-date {
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--text-dim);
}

.about-prose p {
  margin: 0 0 1.25rem;
  padding-left: 40px;
}

.about-prose a {
  color: var(--text-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.about-prose a:hover {
  color: var(--text-muted);
}

.about-prose em {
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
</style>
