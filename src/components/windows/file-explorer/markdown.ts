function inlineMarkdown(text: string, baseUrl?: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, src: string) => {
      const resolved = /^https?:\/\//.test(src) ? src : (baseUrl ?? "") + src;
      return `<span class="img-expand-wrap"><img src="${resolved}" alt="${alt}" /></span>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[((?:[^\[\]]|\[[^\]]*\])*)\]\(([^)]+)\)/g, (_m, text: string, href: string) => {
      if (/^https?:\/\//.test(href)) return `<a href="${href}" target="_blank">${text}</a>`;
      return `<a href="${href}" data-internal>${text}</a>`;
    });
}

function preserveHtmlTags(src: string): { text: string; slots: string[] } {
  const slots: string[] = [];
  const allowed =
    /<(p|h1)\s+align="center"\s*>|<\/(p|h1|b|code)>|<(b|code)>|<img\s+(?:src|alt|width|height)="[^"]*"(?:\s+(?:src|alt|width|height)="[^"]*")*\s*\/?>/gi;
  const text = src.replace(allowed, (m) => {
    slots.push(m);
    return `\x00SLOT${slots.length - 1}\x00`;
  });
  return { text, slots };
}

function restoreHtmlTags(html: string, slots: string[], baseUrl?: string): string {
  return html.replace(/\x00SLOT(\d+)\x00/g, (_m, i) => {
    let tag = slots[Number(i)];
    if (baseUrl) {
      tag = tag.replace(/src="([^"]+)"/g, (_s, src: string) => {
        if (/^https?:\/\//.test(src)) return `src="${src}"`;
        return `src="${baseUrl}${src}"`;
      });
    }
    if (tag.startsWith("<img")) tag = `<span class="img-expand-wrap">${tag}</span>`;
    return tag;
  });
}

export function renderMd(src: string, baseUrl?: string): string {
  const { text: preserved, slots } = preserveHtmlTags(src);
  let html = preserved
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
    `<pre class="md-code-block"><code>${code.replace(/\n$/, "")}</code></pre>`
  );

  // Parse tables before line-by-line processing
  html = html.replace(
    /((?:\|[^\n]+\|\n)+)/g,
    (block) => {
      const rows = block.trim().split("\n").filter((r) => r.trim());
      if (rows.length < 2) return block;
      // Check if second row is a separator
      if (!/^\|[\s-:|]+\|$/.test(rows[1])) return block;
      const parseRow = (row: string) =>
        row.split("|").slice(1, -1).map((c) => c.trim());
      const headers = parseRow(rows[0]);
      const bodyRows = rows.slice(2);
      let t = "<table><thead><tr>";
      for (const h of headers) t += `<th>${inlineMarkdown(h, baseUrl)}</th>`;
      t += "</tr></thead><tbody>";
      for (const row of bodyRows) {
        t += "<tr>";
        for (const cell of parseRow(row)) t += `<td>${inlineMarkdown(cell, baseUrl)}</td>`;
        t += "</tr>";
      }
      t += "</tbody></table>";
      return t;
    }
  );

  const lines = html.split("\n");
  const out: string[] = [];
  let listDepth = 0;
  const indentStack: number[] = [];
  let inCodeBlock = false;
  let inTable = false;

  function closeLists() {
    while (listDepth > 0) { out.push("</ul>"); listDepth--; }
    indentStack.length = 0;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<pre class="md-code-block">')) {
      inCodeBlock = true;
      out.push(line);
      continue;
    }
    if (inCodeBlock) {
      out.push(line);
      if (line.includes("</pre>")) inCodeBlock = false;
      continue;
    }
    if (line.includes("<table")) { inTable = true; }
    if (inTable) {
      out.push(line);
      if (line.includes("</table>")) inTable = false;
      continue;
    }

    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      closeLists();
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineMarkdown(hMatch[2], baseUrl)}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*])\s+(.*)/);
    if (listMatch) {
      const indent = listMatch[1].length;
      let depth: number;
      if (listDepth === 0 || indent > indentStack[indentStack.length - 1]) {
        depth = listDepth + 1;
        indentStack.push(indent);
      } else {
        // Find the matching depth for this indent level
        depth = indentStack.findIndex(i => i >= indent) + 1;
        if (depth === 0) depth = 1;
        indentStack.length = depth;
        indentStack[depth - 1] = indent;
      }
      while (listDepth < depth) { out.push("<ul>"); listDepth++; }
      while (listDepth > depth) { out.push("</ul>"); listDepth--; }
      out.push(`<li>${inlineMarkdown(listMatch[3], baseUrl)}</li>`);
      continue;
    }

    if (listDepth > 0 && line.trim() === "") {
      closeLists();
    }

    if (line.match(/^---+$/)) {
      out.push("<hr>");
      continue;
    }

    if (line.trim() === "") {
      out.push("");
      continue;
    }

    if (/\x00SLOT\d+\x00/.test(line)) {
      closeLists();
      out.push(line);
      continue;
    }

    closeLists();
    // Accumulate consecutive plain lines into one <p>
    const pLines = [inlineMarkdown(line, baseUrl)];
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      if (next.trim() === "" || next.match(/^(#{1,6})\s+/) || next.match(/^(\s*)([-*])\s+/) || next.match(/^---+$/) || next.includes("<table") || next.includes('<pre class="md-code-block">') || /\x00SLOT\d+\x00/.test(next)) break;
      pLines.push(inlineMarkdown(next, baseUrl));
      i++;
    }
    out.push(`<p>${pLines.join("<br>")}</p>`);
  }
  closeLists();

  return restoreHtmlTags(out.join("\n"), slots, baseUrl);
}
