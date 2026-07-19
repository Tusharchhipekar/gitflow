import prisma from "@repo/db-prisma";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getModel } from "./agent.worker";
import {
  SectionPlanArraySchema,
  PagePlanArraySchema,
  type SectionPlan,
  type PagePlan,
} from "./zod.schema";

async function callModel(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model = getModel();
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : response.content
          .map((block: any) => (block.type === "text" ? block.text : ""))
          .join("");

  return text.replace(/```json|```/g, "").trim();
}

// Parses raw model text as JSON, then validates against the given Zod schema.
// Throws a clear error identifying which stage failed and why, rather than
// letting a malformed/hallucinated response crash somewhere downstream.
function parseAndValidate<T>(
  raw: string,
  schema: { parse: (data: unknown) => T },
  context: string,
): T {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `${context}: model did not return valid JSON. Raw output: ${raw.slice(0, 500)}`,
    );
  }

  const result = schema.parse(json); // throws ZodError with details if invalid
  return result;
}

// ---------- Pass 1: sections ----------

async function planSections(
  owner: string,
  name: string,
  files: string[],
): Promise<SectionPlan[]> {
  const systemPrompt = `You design documentation site structures for code repositories.
Given a flat list of file paths, produce an ordered list of top-level documentation sections
(e.g. "Compiler", "Server", "CLI", "Examples", "Docs"). Aim for 5-12 sections for a typical
repo — fewer for small repos, more only if the repo is genuinely large and multi-part.
Respond with ONLY a JSON array, no prose, no markdown fences. Each item:
{ "title": string, "order": number, "pathHints": string[] }
"pathHints" should be 1-5 short path prefixes or substrings that best identify which files
belong in this section (used internally, not shown to users).`;

  const userPrompt = `Repo: ${owner}/${name}\n\nFile paths (${files.length} total):\n${files.join("\n")}`;

  const raw = await callModel(systemPrompt, userPrompt);
  return parseAndValidate(raw, SectionPlanArraySchema, "planSections");
}

// ---------- Pass 2: pages per section ----------

async function planPagesForSection(
  sectionTitle: string,
  candidateFiles: string[],
): Promise<PagePlan[]> {
  const systemPrompt = `You design documentation pages for one section of a repo's docs site.
Given a section title and a candidate list of files belonging to it, break the section into
an ordered list of pages. Aim for 2-8 pages per section depending on how much the candidate
files cover. Each page must list which of the given files it's based on — do not invent file
paths that aren't in the candidate list.
Respond with ONLY a JSON array, no prose, no markdown fences. Each item:
{ "slug": string (kebab-case, unique within this section), "title": string, "order": number,
  "sourceFiles": string[] }`;

  const userPrompt = `Section: ${sectionTitle}\n\nCandidate files (${candidateFiles.length} total):\n${candidateFiles.join("\n")}`;

  const raw = await callModel(systemPrompt, userPrompt);
  return parseAndValidate(
    raw,
    PagePlanArraySchema,
    `planPagesForSection("${sectionTitle}")`,
  );
}

// ---------- Helpers ----------

function filterCandidates(files: string[], hints: string[]): string[] {
  const matched = files.filter((f) => hints.some((hint) => f.includes(hint)));
  return matched.length > 0 ? matched : files; // fallback: no match -> give the whole list
}

function dedupeSlugs(pages: PagePlan[]): PagePlan[] {
  const seen = new Map<string, number>();
  return pages.map((page) => {
    const count = seen.get(page.slug) ?? 0;
    seen.set(page.slug, count + 1);
    return count === 0 ? page : { ...page, slug: `${page.slug}-${count + 1}` };
  });
}

// ---------- Orchestrator ----------

export async function planRepo(repoId: number, files: string[]): Promise<void> {
  const repo = await prisma.repo.findUniqueOrThrow({ where: { id: repoId } });

  const sections = await planSections(repo.owner, repo.name, files);

  for (const section of sections) {
    const candidateFiles = filterCandidates(files, section.pathHints);
    let pages = await planPagesForSection(section.title, candidateFiles);

    // Guard against hallucinated file paths — only keep files that actually exist in the tree
    pages = pages.map((page) => ({
      ...page,
      sourceFiles: page.sourceFiles.filter((f) => files.includes(f)),
    }));

    // Drop pages left with zero valid source files after the filter above
    pages = pages.filter((page) => page.sourceFiles.length > 0);

    if (pages.length === 0) {
      console.warn(
        `Section "${section.title}" produced no valid pages after filtering — skipping`,
      );
      continue;
    }

    pages = dedupeSlugs(pages);

    const createdSection = await prisma.section.create({
      data: { repoId, title: section.title, order: section.order },
    });

    for (const page of pages) {
      await prisma.page.create({
        data: {
          sectionId: createdSection.id,
          slug: page.slug,
          title: page.title,
          order: page.order,
          markdown: "", // filled in by the future "generating" step
          sourceFiles: JSON.stringify(page.sourceFiles),
        },
      });
    }
  }

  await prisma.repo.update({
    where: { id: repoId },
    data: { status: "generating" },
  });
}
