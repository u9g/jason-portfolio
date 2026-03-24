const modules = import.meta.glob("./essays/*.md", { eager: true, query: "?raw", import: "default" });

export interface Essay {
  title: string;
  date: string;
  slug: string;
  paragraphs: string[];
}

function parseEssay(raw: string): Essay {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid essay frontmatter");

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx !== -1) {
      frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  const body = match[2].trim();
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return {
    title: frontmatter.title,
    date: frontmatter.date,
    slug: frontmatter.slug,
    paragraphs,
  };
}

export const essays: Essay[] = Object.values(modules)
  .map((raw) => parseEssay(raw as string))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getEssay(slug: string): Essay | undefined {
  return essays.find((e) => e.slug === slug);
}
