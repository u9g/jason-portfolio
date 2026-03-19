<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{ toggleSidebar: [] }>();

const aboutContent = ref<HTMLElement | null>(null);
const particle = ref<HTMLElement | null>(null);

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

const colors = ["#f7df1e", "#ff6b4a", "#c77dff", "#58a6ff"];
let currentIndex = 0;
let animationId: number | undefined;
let alive = true;
let paused = false;
let pauseTime = 0;
let hopStartTime = 0;
let hopDuration = 0;
let hopArcHeight = 0;
let hopFrom = { x: 0, y: 0 };
let hopTo = { x: 0, y: 0 };
let hopStartColor = "";
let hopEndColor = "";

function pauseParticle() {
  paused = true;
  pauseTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
}

function resumeParticle() {
  paused = false;
  const elapsed = performance.now() - pauseTime;
  hopStartTime += elapsed;
  animationId = requestAnimationFrame(step);
}

function getLinks() {
  if (!aboutContent.value) return [];
  return Array.from(aboutContent.value.querySelectorAll("a"));
}

function getLinkCenter(link: Element) {
  const rect = link.getBoundingClientRect();
  const parentRect = aboutContent.value!.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - parentRect.left,
    y: rect.top - parentRect.top,
  };
}

let nextIndex = 0;

function step(now: number) {
  if (!alive || paused) return;
  const el = particle.value;
  if (!el) return;

  const t = Math.min((now - hopStartTime) / hopDuration, 1);

  const x = hopFrom.x + (hopTo.x - hopFrom.x) * t;
  const midY = (hopFrom.y + hopTo.y) / 2;
  const y = midY - hopArcHeight * Math.sin(Math.PI * t);

  el.style.transform = `translate(${x}px, ${y}px)`;
  el.style.background = lerpColor(hopStartColor, hopEndColor, t);
  el.style.boxShadow = `0 0 6px ${lerpColor(hopStartColor, hopEndColor, t)}`;

  if (t < 1) {
    animationId = requestAnimationFrame(step);
  } else {
    currentIndex = nextIndex;
    animateHop();
  }
}

function animateHop() {
  const links = getLinks();
  if (links.length === 0 || !particle.value || !alive || paused) return;

  const fromIndex = currentIndex;
  nextIndex = (currentIndex + 1) % links.length;
  hopFrom = getLinkCenter(links[fromIndex]);
  hopTo = getLinkCenter(links[nextIndex]);
  hopStartColor = colors[fromIndex];
  hopEndColor = colors[nextIndex];
  hopDuration = 1000;
  hopArcHeight = 25 + Math.random() * 40;
  hopStartTime = performance.now();

  const el = particle.value;
  el.style.opacity = "1";
  el.style.background = hopStartColor;
  el.style.boxShadow = `0 0 6px ${hopStartColor}`;

  animationId = requestAnimationFrame(step);
}

onMounted(() => {
  animateHop();
  const links = getLinks();
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
      <button v-if="sidebarCollapsed" class="sidebar-toggle" @click="emit('toggleSidebar')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"></path></svg>
      </button>
    </div>
    <div class="about-content" ref="aboutContent">
      <div ref="particle" class="particle" />
      <p>Hi, my name is Jason and I have programmed for a while. Along that journey I have programmed in many different programming languages such as <a href="https://github.com/PrismarineJS/mineflayer/commits?author=u9g" target="_blank" rel="noopener noreferrer" class="lang-js">Javascript ↗</a>, <a href="https://github.com/obi1kenobi/trustfall/commits?author=u9g" target="_blank" rel="noopener noreferrer" class="lang-rust">Rust ↗</a>, <a href="https://github.com/u9g/Utils" target="_blank" rel="noopener noreferrer" class="lang-kotlin">Kotlin ↗</a>, and <a href="https://github.com/u9g/competingmarkets" target="_blank" rel="noopener noreferrer" class="lang-ts">Typescript ↗</a>.</p>
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  margin-left: -3px;
  margin-top: -3px;
}

.lang-js { color: #f7df1e; }
.lang-rust { color: #ff6b4a; }
.lang-kotlin { color: #c77dff; }
.lang-ts { color: #58a6ff; }
</style>
