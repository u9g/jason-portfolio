/**
 * Lint: ensure programming language / technology names are properly capitalized
 * in user-facing content (conversations.json, .vue template/text).
 *
 * Usage: node scripts/lint-lang-caps.mjs
 * Exit code 0 = clean, 1 = violations found.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

// Map of correct capitalization → regex that catches wrong variants.
// Each regex must NOT match the correct form.
const rules = [
  { correct: "JavaScript", pattern: /\bjavascript\b/gi, reject: (m) => m !== "JavaScript" },
  { correct: "TypeScript", pattern: /\btypescript\b/gi, reject: (m) => m !== "TypeScript" },
  { correct: "Java", pattern: /\bjava\b/gi, reject: (m) => m !== "Java" },
  { correct: "Kotlin", pattern: /\bkotlin\b/gi, reject: (m) => m !== "Kotlin" },
  { correct: "Rust", pattern: /\brust\b/gi, reject: (m) => m !== "Rust" },
  { correct: "Gleam", pattern: /\bgleam\b/gi, reject: (m) => m !== "Gleam" },
  { correct: "Python", pattern: /\bpython\b/gi, reject: (m) => m !== "Python" },
  { correct: "SwiftUI", pattern: /\bswiftui\b/gi, reject: (m) => m !== "SwiftUI" },
  { correct: "MongoDB", pattern: /\bmongodb\b/gi, reject: (m) => m !== "MongoDB" },
  { correct: "PostHog", pattern: /\bposthog\b/gi, reject: (m) => m !== "PostHog" },
  { correct: "React Native", pattern: /\breact native\b/gi, reject: (m) => m !== "React Native" },
  { correct: "React", pattern: /\breact\b(?!-)/gi, reject: (m) => m !== "React" },
];

const SRC = new URL("../src", import.meta.url).pathname;
const EXTENSIONS = new Set([".json", ".vue", ".ts"]);

// Lines to ignore: code constructs, CSS, JS internals
function isCodeLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("import ") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("const ") ||
    trimmed.startsWith("let ") ||
    trimmed.startsWith("var ") ||
    /^\w+:/.test(trimmed) ||           // object keys like `typescript: "#58a6ff"`
    /lang-/.test(trimmed) ||           // CSS class references like lang-java, lang-rust
    /class="/.test(trimmed) ||         // HTML class attributes
    /classList/.test(trimmed) ||
    /isActive\(/.test(trimmed) ||      // isActive('lang-java') calls
    /data-highlight/.test(trimmed) ||  // data attribute selectors
    /\.highlight-active/.test(trimmed) || // CSS highlight rules
    /colorMap/.test(trimmed) ||
    /langColors/.test(trimmed) ||
    /langPattern/.test(trimmed) ||
    /color:\s*#/.test(trimmed)         // CSS color declarations
  );
}

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (EXTENSIONS.has(extname(full))) {
      files.push(full);
    }
  }
  return files;
}

let violations = 0;

for (const file of collectFiles(SRC)) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCodeLine(line)) continue;

    for (const rule of rules) {
      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        if (rule.reject(match[0])) {
          const rel = file.replace(SRC + "/", "");
          console.log(
            `${rel}:${i + 1}: "${match[0]}" should be "${rule.correct}"`
          );
          violations++;
        }
      }
    }
  }
}

if (violations > 0) {
  console.log(`\n${violations} capitalization violation(s) found.`);
  process.exit(1);
} else {
  console.log("All language names properly capitalized.");
  process.exit(0);
}
