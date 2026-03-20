<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
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

const tocEntries = [
  { id: "about", title: "About Me" },
  { id: "jobs", title: "Job Experience" },
  { id: "projects", title: "Personal Projects" },
  { id: "oss", title: "Notable OSS Contributions" },
];

const expandedRepos = ref<Set<string>>(new Set());

function copyAnchor(id: string) {
  window.location.hash = `readme-${id}`;
}

onMounted(async () => {
  fetchRepoInfo();
  await nextTick();
  const hash = window.location.hash;
  if (hash.startsWith("#readme-")) {
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }
});
</script>

<template>
  <div id="readme-view" class="readme-view">
    <div class="readme-banner">
      <a href="#about">Make it look like Claude <img :src="claudeIcon" class="claude-logo" aria-hidden="true" /></a>
    </div>

    <div class="readme-body">
      <h1>Jason Lernerman's Portfolio</h1>

      <nav class="toc">
        <h2>Table of Contents</h2>
        <ul>
          <li v-for="entry in tocEntries" :key="entry.id">
            <a :href="`#readme-${entry.id}`">{{ entry.title }}</a>
          </li>
        </ul>
      </nav>

      <!-- About -->
      <h2
        :id="'readme-about'"
        class="section-header"
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

      <!-- Job Experience -->
      <h2 id="readme-jobs" class="section-header" @click="copyAnchor('jobs')">
        <span class="anchor-icon">#</span> Job Experience
      </h2>
      <div
        v-for="job in conversations.jobs"
        :key="job.slug"
        class="section-content"
      >
        <h3
          :id="`readme-${job.slug}`"
          class="sub-header"
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
        id="readme-projects"
        class="section-header"
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
          :id="`readme-${project.slug}`"
          class="sub-header"
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
      <h2 id="readme-oss" class="section-header" @click="copyAnchor('oss')">
        <span class="anchor-icon">#</span> Notable OSS Contributions
      </h2>
      <div class="section-content">
        <div v-for="repo in sortedRepos" :key="repo.name" class="oss-repo">
          <h3
            :id="`readme-oss-${repo.name.replace('/', '-')}`"
            class="repo-header"
            @click="copyAnchor(`oss-${repo.name.replace('/', '-')}`)"
          >
            <span class="anchor-icon">#</span>
            <span class="lang-dot" :style="{ background: repo.color }"></span>
            <a
              :href="`https://github.com/${repo.name}`"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >{{ repo.name }} ↗</a
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
}

.readme-body h1 {
  font-size: 2rem;
  margin: 0 0 1.5rem;
  color: var(--text-bright);
}

.toc {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-raised);
  border-radius: 8px;
  border: 1px solid var(--border-color);
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

.toc ul ul {
  margin-top: 0.3rem;
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

.section-header:hover .anchor-icon {
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

.sub-header:hover .anchor-icon {
  opacity: 1;
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

.repo-header:hover .anchor-icon {
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
