
type TocItem = { id: string; text: string; level: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of markdown.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({ id: slugify(text), text, level });
    }
  }
  return items;
}

type TableOfContentsProps = {
  markdown: string;
};

export function TableOfContents({ markdown }: TableOfContentsProps) {
  const items = extractHeadings(markdown);
  if (items.length === 0) return null;

  return (
    <aside className="w-64 flex-shrink-0 overflow-y-auto p-6">
      <p className="mb-4 text-label-sm uppercase tracking-wider text-on-surface-variant">
        On this page
      </p>
      <nav className="flex flex-col gap-2 border-l border-outline-variant">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`-ml-px border-l-2 border-transparent text-body-md text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface ${
              item.level === 3 ? "pl-8" : "pl-4"
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}