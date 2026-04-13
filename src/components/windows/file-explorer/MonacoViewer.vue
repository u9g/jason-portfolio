<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from "vue";

// Monaco workers — use simple editor worker, skip language-specific ones
self.MonacoEnvironment = {
  getWorker: () => new Worker(
    new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url),
    { type: "module" },
  ),
};

const props = defineProps<{
  content: string;
  fileName: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
const editorRef = shallowRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  mjs: "javascript", cjs: "javascript", vue: "html", html: "html",
  css: "css", scss: "scss", less: "less", json: "json", jsonc: "json",
  md: "markdown", yaml: "yaml", yml: "yaml", xml: "xml", svg: "xml",
  sh: "shell", bash: "shell", zsh: "shell", py: "python",
  rs: "rust", go: "go", java: "java", kt: "kotlin",
  rb: "ruby", php: "php", sql: "sql", graphql: "graphql",
  toml: "ini", ini: "ini", dockerfile: "dockerfile",
  ex: "elixir", exs: "elixir", eex: "html", heex: "html",
  swift: "swift", c: "c", cpp: "cpp", h: "c", hpp: "cpp",
  txt: "plaintext", lock: "plaintext", log: "plaintext",
};

function getLang(fileName: string): string {
  const name = fileName.split("/").pop()?.toLowerCase() ?? "";
  if (name === "dockerfile") return "dockerfile";
  if (name === "makefile") return "plaintext";
  const ext = name.split(".").pop() ?? "";
  return EXT_TO_LANG[ext] ?? "plaintext";
}

onMounted(async () => {
  const monaco = await import("monaco-editor");

  if (!containerRef.value) return;

  const editor = monaco.editor.create(containerRef.value, {
    value: props.content,
    language: getLang(props.fileName),
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 12,
    lineNumbers: "on",
    renderLineHighlight: "none",
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
    automaticLayout: true,
    domReadOnly: true,
  });

  editorRef.value = editor;
});

watch(() => props.content, (val) => {
  if (editorRef.value) {
    editorRef.value.setValue(val);
  }
});

watch(() => props.fileName, () => {
  if (editorRef.value) {
    const monaco = editorRef.value.getModel();
    if (monaco) {
      import("monaco-editor").then((m) => {
        m.editor.setModelLanguage(monaco, getLang(props.fileName));
      });
    }
  }
});

onBeforeUnmount(() => {
  editorRef.value?.dispose();
});
</script>

<template>
  <div ref="containerRef" class="monaco-container"></div>
</template>

<style lang="css" scoped>
.monaco-container {
  flex: 1;
  min-height: 0;
}
</style>
