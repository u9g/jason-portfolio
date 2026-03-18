# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite HMR)
npm run build     # Type-check with vue-tsc, then build production bundle
npm run preview   # Preview production build locally
```

No lint or test scripts are configured.

## Architecture

Vue 3 + TypeScript + Vite portfolio site with a conversation-style UI.

**Data flow:**
- `index.html` → `src/main.ts` (mounts app) → `App.vue` (root)
- `App.vue` owns hash-based routing (`window.location.hash`) — maps hashes like `#cerium` and `#midnight-sky` to project conversations; unrecognized hashes render a 404 state
- `App.vue` renders `Sidebar.vue` (navigation, collapsible) and `Conversation.vue` (content display) side-by-side

**Components:**
- `Sidebar.vue` — nav links + collapse/expand toggle with CSS transition animation
- `Conversation.vue` — displays content for the active route

**Styling:** Global styles in `src/style.css`. Dark theme defined in `index.html` (background `#262624`, text `#faf9f5`). Google Fonts loads Lora (serif) via `index.html`.

**TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters` enforced. Uses `<script setup>` syntax throughout.
