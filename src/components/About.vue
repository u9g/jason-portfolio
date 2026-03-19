<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

const aboutContent = ref<HTMLElement | null>(null);
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
      <label class="particle-toggle">
        <input
          type="checkbox"
          :checked="particleEnabled"
          @change="toggleParticle"
        />
        show particle
      </label>
    </div>
    <div class="about-content" ref="aboutContent">
      <div ref="particle" class="particle" />
      <p>
        Hi, my name is Jason and I have been programming for a while. Since way
        back in senior year of highschool, when I decided I would learn
        Javascript to
        <a
          href="https://github.com/PrismarineJS/mineflayer"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-js"
          >make a minecraft bot ↗</a
        >. Then I learned Typescript so I could
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
        for Javascript minecraft bots. Along that journey I have programmed in
        many different programming languages such as
        <a
          href="https://github.com/PrismarineJS/mineflayer/commits?author=u9g"
          target="_blank"
          rel="noopener noreferrer"
          class="lang-js"
          >Javascript ↗</a
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
          >Typescript ↗</a
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
}

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
</style>
