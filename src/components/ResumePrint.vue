<script setup lang="ts">
import conversations from "../data/conversations.json";
import { stripMarkdownLinks } from "../data/render-markdown";

// The resume container is always mounted but hidden via the
// `.resume-print-container { display: none }` rule below; the @media print
// block flips it to display: block during printing. Keeping it permanently
// in the DOM matters for Safari/iOS, where `window.print()` returns
// immediately instead of blocking — toggling a v-if around the call would
// race the browser's print capture and produce a blank page.
function printResume() {
  window.print();
}

defineExpose({ printResume });

type QA = { question: string; answer: string };

const hiddenQuestions = /when did you make it|any interesting features/i;

type Message = { role: string; message: string };

function extractQA(messages: Message[], skipFirst: boolean): QA[] {
  const qa: QA[] = [];
  for (let i = skipFirst ? 2 : 0; i < messages.length - 1; i += 2) {
    if (messages[i].role === "user" && messages[i + 1]?.role === "assistant") {
      if (hiddenQuestions.test(messages[i].message)) continue;
      let answer = stripMarkdownLinks(messages[i + 1].message);
      if (answer.length > 200) {
        const cut = answer.lastIndexOf(".", 200);
        answer = cut > 80 ? answer.slice(0, cut + 1) : answer.slice(0, 200) + "…";
      }
      qa.push({ question: messages[i].message, answer });
    }
  }
  return qa;
}

function extractJobQA(conv: typeof conversations.jobs[number]): { title: string; period: string; qa: QA[] } {
  const { title, conversation: messages } = conv;

  let period = "";
  if (!/intern/i.test(title)) {
    const allText = messages.filter((m) => m.role === "assistant").map((m) => m.message).join(" ");
    const periodMatch = allText.match(/(?:from |)(\w+ \d{4})\s*to\s*(\w+ \d{4})/i);
    if (periodMatch) period = `${periodMatch[1]} – ${periodMatch[2]}`;
  }

  return { title, period, qa: extractQA(messages, true) };
}

const jobEntries = conversations.jobs.map(extractJobQA);
const resumeProjectSlugs = new Set(["unoroyale", "learntensors"]);
const projectEntries = conversations.projects
  .filter((p) => resumeProjectSlugs.has(p.slug))
  .map((conv) => ({ title: conv.title, qa: extractQA(conv.conversation, false).slice(0, 3) }));
</script>

<template>
  <Teleport to="body">
    <div class="resume-print-container">
      <div class="resume">
        <header class="resume-header">
          <h1>Jason Lernerman</h1>
          <div class="contact-row">
            <a href="https://jasonlernerman.com">jasonlernerman.com</a>
            <span>·</span>
            <a href="https://github.com/u9g">github.com/u9g</a>
            <span>·</span>
            <a href="https://linkedin.com/in/jason-lernerman">LinkedIn</a>
          </div>
        </header>

        <section>
          <h2>Experience</h2>
          <div v-for="job in jobEntries" :key="job.title" class="entry">
            <div class="entry-header">
              <strong>{{ job.title }}</strong>
              <span class="date">{{ job.period }}</span>
            </div>
            <div v-for="(item, i) in job.qa" :key="i" class="qa-pair">
              <span class="qa-q">{{ item.question }}</span>
              <span class="qa-a">{{ item.answer }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2>Personal Projects</h2>
          <div v-for="proj in projectEntries" :key="proj.title" class="entry">
            <div class="entry-header">
              <strong>{{ proj.title }}</strong>
            </div>
            <div v-for="(item, i) in proj.qa" :key="i" class="qa-pair">
              <span class="qa-q">{{ item.question }}</span>
              <span class="qa-a">{{ item.answer }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2>Education</h2>
          <div class="entry">
            <div class="entry-header">
              <strong>Pennsylvania State University — BS in Computer Science</strong>
              <span class="date">May 2025</span>
            </div>
          </div>
        </section>

        <p class="resume-footer">This resume is adapted from my website, any lines that were shortened can be read in full at jasonlernerman.com</p>
      </div>
    </div>
  </Teleport>
</template>

<style lang="css">
.resume-print-container {
  display: none;
}

@media print {
  @page {
    size: letter;
    margin: 0;
  }

  .resume-print-container {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
    background: white;
  }

  .resume {
    width: 100%;
    max-width: 7.5in;
    margin: 0 auto;
    padding: 0.4in 0.5in;
    box-sizing: border-box;
    font-family: "Lora", Georgia, serif;
    color: #1a1a1a;
    font-size: 7.5pt;
    line-height: 1.3;
  }

  .resume-header {
    text-align: center;
    margin-bottom: 8pt;
    border-bottom: 1.5pt solid #1a1a1a;
    padding-bottom: 5pt;
  }

  .resume-header h1 {
    font-size: 15pt;
    margin: 0 0 4pt;
    letter-spacing: 0.5pt;
  }

  .contact-row {
    font-size: 7.5pt;
    color: #444;
    display: flex;
    justify-content: center;
    gap: 6pt;
  }

  .contact-row a {
    color: #444;
    text-decoration: none;
  }

  .resume h2 {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 1pt;
    border-bottom: 0.75pt solid #999;
    padding-bottom: 2pt;
    margin: 8pt 0 4pt;
  }

  .entry {
    margin-bottom: 5pt;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .date {
    font-size: 7.5pt;
    color: #555;
    white-space: nowrap;
  }

  .qa-pair {
    margin: 1pt 0 1pt 10pt;
  }

  .qa-q {
    font-weight: bold;
    font-size: 8.5pt;
    color: #333;
  }

  .qa-q::before {
    content: "Q: ";
    font-weight: bold;
  }

  .qa-a {
    display: block;
    margin-top: 0.5pt;
    font-size: 8.5pt;
    color: #444;
  }

  .qa-a::before {
    content: "A: ";
    font-weight: bold;
    color: #333;
  }

  .resume-footer {
    text-align: center;
    font-size: 8.5pt;
    color: #777;
    margin-top: 10pt;
    font-style: italic;
  }
}
</style>
