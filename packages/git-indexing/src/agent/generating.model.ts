import prisma from "@repo/db-prisma";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getModel } from "./agent.worker";
import { fetchFilesContents } from "../github-fetch";
import { callWithRateLimit } from "./rate-limiter";

const MERMAID_BLOCK_PATTERN = /```mermaid[\s\S]*?```/;

function stripCodeFences(text: string): string {
  // Model sometimes wraps the *whole* response in a stray ```markdown fence —
  // strip only a leading/trailing wrapper fence, not fences inside the content
  // (e.g. the mermaid block itself must survive this).
  const trimmed = text.trim();
  const wrapperMatch = trimmed.match(/^```(?:markdown)?\n([\s\S]*)\n```$/);
  return wrapperMatch?.[1] ?? trimmed;
}

async function callModel(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model = getModel();
  const response = await callWithRateLimit(() =>
    model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]),
  );

  const text =
    typeof response.content === "string"
      ? response.content
      : response.content
          .map((block: any) => (block.type === "text" ? block.text : ""))
          .join("");

  return stripCodeFences(text);
}

interface PageContext {
  id: number;
  slug: string;
  title: string;
  sourceFiles: string; // JSON string, per schema
}

async function generatePageMarkdown(
  owner: string,
  name: string,
  sha: string,
  sectionTitle: string,
  page: PageContext,
): Promise<string> {
  const sourceFiles: string[] = JSON.parse(page.sourceFiles);

  const contents = await fetchFilesContents(owner, name, sha, sourceFiles);
  const fileBlocks = Object.entries(contents)
    .map(([path, content]) => `--- ${path} ---\n${content}`)
    .join("\n\n");

  if (Object.keys(contents).length === 0) {
    console.warn(
      `Page "${page.title}" (id ${page.id}): no source files could be fetched, generating from filenames only`,
    );
  }

  const systemPrompt = `You write documentation pages for a codebase, in Markdown.

For this page you must produce:
1. A clear explanation of what this code does and how it fits into the section "${sectionTitle}".
2. Exactly ONE Mermaid sequence diagram (using \`\`\`mermaid fences) showing the request/call
   flow between the relevant components/services/functions visible in the source files. Use
   real names found in the code (function names, service names, endpoints) rather than generic
   placeholders. If the files don't show a clear request flow (e.g. it's a types/config file),
   still include a best-effort sequence diagram of how this code is invoked/used by the rest of
   the system, inferred from imports, exports, and naming.

Respond with ONLY the markdown content — no preamble, no wrapping code fence around the whole
response, no explanation of what you're doing. Start directly with a heading.`;

  const userPrompt = `Page title: ${page.title}\nSection: ${sectionTitle}\n\nSource files:\n\n${fileBlocks || "(no file contents available — filenames only: " + sourceFiles.join(", ") + ")"}`;

  let markdown = await callModel(systemPrompt, userPrompt);

  if (!MERMAID_BLOCK_PATTERN.test(markdown)) {
    console.warn(
      `Page "${page.title}" (id ${page.id}): no mermaid block found, retrying once`,
    );
    const retryPrompt =
      userPrompt +
      "\n\nIMPORTANT: your previous response did not include a ```mermaid fenced sequence diagram. You MUST include exactly one.";
    markdown = await callModel(systemPrompt, retryPrompt);

    if (!MERMAID_BLOCK_PATTERN.test(markdown)) {
      // Don't fail the whole page over a missing diagram — ship the prose,
      // log loudly so it's visible this page needs a manual look.
      console.error(
        `Page "${page.title}" (id ${page.id}): still no mermaid block after retry, saving without diagram`,
      );
    }
  }

  return markdown;
}

export async function generateRepo(repoId: number): Promise<void> {
  const repo = await prisma.repo.findUniqueOrThrow({ where: { id: repoId } });

  const sections = await prisma.section.findMany({
    where: { repoId },
    orderBy: { order: "asc" },
    include: { pages: { orderBy: { order: "asc" } } },
  });

  for (const section of sections) {
    for (const page of section.pages) {
      try {
        const markdown = await generatePageMarkdown(
          repo.owner,
          repo.name,
          repo.sha,
          section.title,
          page,
        );

        await prisma.page.update({
          where: { id: page.id },
          data: { markdown },
        });
      } catch (err) {
        // One page failing shouldn't take down the whole repo's generation —
        // log it and leave that page's markdown empty for a manual retry later.
        console.error(
          `Failed to generate page "${page.title}" (id ${page.id}):`,
          err,
        );
      }
    }
  }

  await prisma.repo.update({
    where: { id: repoId },
    data: { status: "ready" },
  });
}
