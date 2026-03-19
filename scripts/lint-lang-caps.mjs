/**
 * Lint: ensure programming language / technology names are properly capitalized
 * in user-facing content (conversations.json, .vue template/text).
 *
 * Usage: node scripts/lint-lang-caps.mjs
 * Exit code 0 = clean, 1 = violations found.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const fix = process.argv.includes("--fix");

// Read the canonical tech list from tech-colors.ts
const techFile = new URL("../src/data/tech-colors.ts", import.meta.url).pathname;
const techSource = readFileSync(techFile, "utf-8");
const techNames = [];
for (const match of techSource.matchAll(/^\s*(?:"([^"]+)"|(\w+)):/gm)) {
  techNames.push(match[1] || match[2]);
}

// Build lint rules from the tech names
// Sort longer names first so "React Native" is matched before "React"
const rules = techNames
  .sort((a, b) => b.length - a.length)
  .map((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // For "React", avoid matching "react-scan" etc.
    const suffix = name === "React" ? "(?!-)" : "";
    return {
      correct: name,
      pattern: new RegExp(`\\b${escaped}${suffix}\\b`, "gi"),
      reject: (m) => m !== name,
    };
  });

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
    trimmed.startsWith("export ") ||
    /^\w+:/.test(trimmed) ||           // object keys like `typescript: "#58a6ff"`
    /lang-/.test(trimmed) ||           // CSS class references like lang-java, lang-rust
    /class="/.test(trimmed) ||         // HTML class attributes
    /classList/.test(trimmed) ||
    /isActive\(/.test(trimmed) ||      // isActive('lang-java') calls
    /data-highlight/.test(trimmed) ||  // data attribute selectors
    /\.highlight-active/.test(trimmed) || // CSS highlight rules
    /colorMap/.test(trimmed) ||
    /techColors/.test(trimmed) ||
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
let fixed = 0;

for (const file of collectFiles(SRC)) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    if (isCodeLine(lines[i])) continue;

    for (const rule of rules) {
      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(lines[i])) !== null) {
        if (rule.reject(match[0])) {
          const rel = file.replace(SRC + "/", "");
          if (fix) {
            lines[i] =
              lines[i].slice(0, match.index) +
              rule.correct +
              lines[i].slice(match.index + match[0].length);
            console.log(
              `${rel}:${i + 1}: fixed "${match[0]}" → "${rule.correct}"`
            );
            fileChanged = true;
            fixed++;
          } else {
            console.log(
              `${rel}:${i + 1}: "${match[0]}" should be "${rule.correct}"`
            );
            violations++;
          }
        }
      }
    }
  }

  if (fix && fileChanged) {
    writeFileSync(file, lines.join("\n"));
  }
}

if (fix) {
  console.log(
    fixed > 0
      ? `\nFixed ${fixed} capitalization issue(s).`
      : "All language names properly capitalized."
  );
  process.exit(0);
} else if (violations > 0) {
  console.log(
    `\n${violations} capitalization violation(s) found. Run with --fix to auto-fix.`
  );
  process.exit(1);
} else {
  console.log("All language names properly capitalized.");
  process.exit(0);
}
