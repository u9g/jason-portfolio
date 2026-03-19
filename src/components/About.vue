<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

const aboutContent = ref<HTMLElement | null>(null);
const highlightLang = ref("");
const lockedLang = ref("");
const particle = ref<HTMLElement | null>(null);
const particleEnabled = ref(true);

function toggleParticle() {
  particleEnabled.value = !particleEnabled.value;
  if (particleEnabled.value) {
    alive = true;
    start();
  } else {
    alive = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (particle.value) particle.value.style.opacity = "0";
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16),
    ag = parseInt(a.slice(3, 5), 16),
    ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16),
    bg = parseInt(b.slice(3, 5), 16),
    bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

const colorMap: Record<string, string> = {
  "lang-js": "#f7df1e",
  "lang-rust": "#ff6b4a",
  "lang-kotlin": "#c77dff",
  "lang-ts": "#58a6ff",
  "lang-java": "#f89820",
  "lang-psu": "#1e6cb6",
  "lang-gleam": "#ffaff3",
};
let currentIndex = 0;
let animationId: number | undefined;
let alive = true;
let paused = false;
let pauseTime = 0;
let lastTime = 0;

// Physics state
let px = 0;
let py = 0;
let startX = 0;
let startY = 0;
let vx = 0;
let vy = 0;
const gravity = 300; // px/s²
let targetIndex = -1;
let flightTime = 0;
let elapsed = 0;
let fromColor = "";
let toColor = "";

function pauseParticle() {
  paused = true;
  pauseTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
}

function resumeParticle() {
  paused = false;
  lastTime = performance.now();
  animationId = requestAnimationFrame(step);
}

function getAllLinks() {
  if (!aboutContent.value) return [];
  return Array.from(aboutContent.value.querySelectorAll("a"));
}

function getLinkColor(link: Element): string {
  for (const cls of link.classList) {
    if (colorMap[cls]) return colorMap[cls];
  }
  return "#faf9f5";
}

function getLinkCenter(link: Element) {
  const rect = link.getBoundingClientRect();
  const parentRect = aboutContent.value!.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - parentRect.left,
    y: rect.top + rect.height / 2 - parentRect.top,
  };
}

function launchToRandom() {
  const links = getAllLinks();
  if (links.length < 2) return;

  const fromIndex = currentIndex % links.length;
  let next: number;
  do {
    next = Math.floor(Math.random() * links.length);
  } while (next === fromIndex);
  targetIndex = next;

  const target = getLinkCenter(links[targetIndex]);
  flightTime = 0.8 + Math.random() * 0.4; // 0.8–1.2s
  elapsed = 0;

  // Solve for initial velocity to land at target in flightTime
  // x: target.x = px + vx * T  →  vx = (target.x - px) / T
  // y: target.y = py + vy * T + 0.5 * g * T²  →  vy = (target.y - py - 0.5 * g * T²) / T
  startX = px;
  startY = py;
  vx = (target.x - px) / flightTime;
  vy = (target.y - py - 0.5 * gravity * flightTime * flightTime) / flightTime;

  fromColor = getLinkColor(links[fromIndex]);
  toColor = getLinkColor(links[targetIndex]);
}

function step(now: number) {
  if (!alive || paused) return;
  const el = particle.value;
  if (!el) return;

  const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt to avoid jumps
  lastTime = now;
  elapsed += dt;

  // Exact kinematic position
  px = startX + vx * elapsed;
  py = startY + vy * elapsed + 0.5 * gravity * elapsed * elapsed;

  const t = Math.min(elapsed / flightTime, 1);
  const color = lerpColor(fromColor, toColor, t);

  el.style.transform = `translate(${px}px, ${py}px)`;
  el.style.background = color;
  el.style.boxShadow = `0 0 6px ${color}`;

  if (elapsed >= flightTime) {
    // Snap to target to avoid drift, then launch again
    const links = getAllLinks();
    if (links.length >= 2) {
      const target = getLinkCenter(links[targetIndex]);
      px = target.x;
      py = target.y;
    }
    currentIndex = targetIndex;
    launchToRandom();
  }

  animationId = requestAnimationFrame(step);
}

function start() {
  const links = getAllLinks();
  if (links.length < 2 || !particle.value) return;

  const first = getLinkCenter(links[0]);
  px = first.x;
  py = first.y;
  lastTime = performance.now();

  const el = particle.value;
  el.style.opacity = "1";

  launchToRandom();
  animationId = requestAnimationFrame(step);
}

onMounted(() => {
  start();
  const links = getAllLinks();
  links.forEach((link) => {
    link.addEventListener("mouseenter", pauseParticle);
    link.addEventListener("mouseleave", resumeParticle);
  });
});

onUnmounted(() => {
  alive = false;
  if (animationId) cancelAnimationFrame(animationId);
});
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
      <button class="share-btn">Share</button>
    </div>
    <div class="about-content" ref="aboutContent" :class="{ 'highlight-active': lockedLang || highlightLang }" :data-highlight="lockedLang || highlightLang">
      <div class="color-index-row">
        <div class="color-index">
          <span :class="['color-swatch', 'lang-js', { 'active-swatch': (lockedLang || highlightLang) === 'lang-js' }]" @mouseenter="highlightLang = 'lang-js'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-js' ? '' : 'lang-js'">JavaScript</span>
          <span :class="['color-swatch', 'lang-ts', { 'active-swatch': (lockedLang || highlightLang) === 'lang-ts' }]" @mouseenter="highlightLang = 'lang-ts'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-ts' ? '' : 'lang-ts'">TypeScript</span>
          <span :class="['color-swatch', 'lang-java', { 'active-swatch': (lockedLang || highlightLang) === 'lang-java' }]" @mouseenter="highlightLang = 'lang-java'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-java' ? '' : 'lang-java'">Java</span>
          <span :class="['color-swatch', 'lang-kotlin', { 'active-swatch': (lockedLang || highlightLang) === 'lang-kotlin' }]" @mouseenter="highlightLang = 'lang-kotlin'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-kotlin' ? '' : 'lang-kotlin'">Kotlin</span>
          <span :class="['color-swatch', 'lang-rust', { 'active-swatch': (lockedLang || highlightLang) === 'lang-rust' }]" @mouseenter="highlightLang = 'lang-rust'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-rust' ? '' : 'lang-rust'">Rust</span>
          <span :class="['color-swatch', 'lang-gleam', { 'active-swatch': (lockedLang || highlightLang) === 'lang-gleam' }]" @mouseenter="highlightLang = 'lang-gleam'" @mouseleave="highlightLang = ''" @click="lockedLang = lockedLang === 'lang-gleam' ? '' : 'lang-gleam'">Gleam</span>
          <button v-if="lockedLang" class="clear-btn" @click="lockedLang = ''">✕</button>
        </div>
        <label class="particle-toggle">
          <input
            type="checkbox"
            :checked="particleEnabled"
            @change="toggleParticle"
          />
          show particle
        </label>
      </div>
      <div ref="particle" class="particle" />
      <p>
        Hi, my name is Jason and I have been programming for a while. Since way
        back in senior year of highschool, when I decided I would learn
        JavaScript to
        <a
          href="https://github.com/PrismarineJS/mineflayer"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-js"
          >make a minecraft bot ↗</a
        >. Then I learned TypeScript so I could
        <a
          href="https://github.com/u9g/minecraft-proxy-handler/commit/6caa09e3fbcbcf3b0e5d96054e4ff46561d4233f"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-ts"
          >make APIs ↗</a
        >
        for myself and others. Around the same time I also started learning Java
        because if you're already making minecraft bots you may as well start
        <a
          href="https://github.com/u9g/ReverseHopper/commit/36300a67a2ecb2400e9fd300634fc91b3e2434bd"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-java"
          >making minecraft mods ↗</a
        >
        and
        <a
          href="https://github.com/u9g/McDataExtracting/commit/2e68722a6afb4366bd1fdb0f12fb8afa127f9fef"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-java"
          >contributing to Java tools↗</a
        >
        for JavaScript minecraft bots. Since then, I learned Kotlin, which is
        the TypeScript to JavaScript in the Java world, and continued making
        <a
          href="https://github.com/u9g/cosmicsky-client"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-kotlin"
          >minecraft mods ↗</a
        >
        and
        <a
          href="https://github.com/u9g/Minigames"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-kotlin"
          >minecraft plugins ↗</a
        >. Around this time, I took a look around the programming landscape and
        made some
        <a
          href="https://github.com/u9g/thatgleammod"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-gleam"
          >minecraft mods in Gleam ↗</a
        >, which is a growing programming language that compiles to Erlang, or in my use case JavaScript.
      </p>
      <p>
        Along that journey I have programmed in many different programming
        languages such as
        <a
          href="https://github.com/PrismarineJS/mineflayer/commits?author=u9g"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-js"
          >JavaScript ↗</a
        >,
        <a
          href="https://github.com/obi1kenobi/trustfall/commits?author=u9g"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-rust"
          >Rust ↗</a
        >,
        <a
          href="https://github.com/u9g/Utils"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-kotlin"
          >Kotlin ↗</a
        >, and
        <a
          href="https://github.com/u9g/competingmarkets"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-ts"
          >TypeScript ↗</a
        >.
      </p>
      <p>
        Since then, I've graduated
        <a
          href="https://www.psu.edu"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-psu"
          >Penn State ↗</a
        >
        and am looking for an exciting place to work!
      </p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
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
}

.color-index-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-index {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.7rem;
}

.color-swatch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-swatch {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.highlight-active .color-swatch {
  opacity: 0.3;
}

.highlight-active .color-swatch.active-swatch {
  opacity: 1;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.clear-btn:hover {
  color: var(--text-bright);
}

.color-swatch::before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 1px;
  background: currentColor;
  flex-shrink: 0;
}

.particle-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
}

.particle-toggle input[type="checkbox"] {
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--text-muted);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.particle-toggle input[type="checkbox"]:checked {
  background: var(--text-muted);
}

.particle-toggle input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 3.5px;
  top: 1px;
  width: 4px;
  height: 7px;
  border: solid var(--bg-base);
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
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

.share-btn {
  margin-left: auto;
  background: transparent;
  border: 0.5px solid var(--text-dim);
  border-radius: 8px;
  color: var(--text-bright);
  cursor: pointer;
  width: 64px;
  height: 32px;
  margin-right: 12px;
  font-family: inherit;
  font-size: 0.8rem;
}

.share-btn:hover {
  background: #000;
}

@media (min-width: 1025px) {
  .sidebar-toggle {
    display: none;
  }
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 300;
  position: relative;
}

.about-content a {
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
  transition: color 0.2s ease;
}

.highlight-active a {
  color: #666 !important;
}

.highlight-active[data-highlight="lang-js"] a.lang-js { color: #f7df1e !important; }
.highlight-active[data-highlight="lang-ts"] a.lang-ts { color: #58a6ff !important; }
.highlight-active[data-highlight="lang-java"] a.lang-java { color: #f89820 !important; }
.highlight-active[data-highlight="lang-kotlin"] a.lang-kotlin { color: #c77dff !important; }
.highlight-active[data-highlight="lang-rust"] a.lang-rust { color: #ff6b4a !important; }
.highlight-active[data-highlight="lang-gleam"] a.lang-gleam { color: #ffaff3 !important; }
.highlight-active[data-highlight="lang-psu"] a.lang-psu { color: #1e6cb6 !important; }

.particle {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  margin-left: -3px;
  margin-top: -3px;
}

.lang-js {
  color: #f7df1e;
}
.lang-rust {
  color: #ff6b4a;
}
.lang-kotlin {
  color: #c77dff;
}
.lang-ts {
  color: #58a6ff;
}
.lang-java {
  color: #f89820;
}
.lang-psu {
  color: #1e6cb6;
}
.lang-gleam {
  color: #ffaff3;
}
</style>
