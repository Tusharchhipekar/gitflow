import type { Request, Response } from "express";
import prisma from "@repo/db-prisma";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import {
  getModel,
  createRateLimiter,
  fetchFilesContents,
} from "@repo/git-indexing";

const { callWithRateLimit } = createRateLimiter(2_000);

export const getMessagesController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageId = Number(req.params.id);
  if (!Number.isInteger(pageId)) {
    return res.status(400).json({ error: "Invalid page id" });
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, section: { repo: { userId: Number(userId) } } },
  });
  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }

  const messages = await prisma.message.findMany({
    where: { pageId, userId: Number(userId) },
    orderBy: { createdAt: "asc" },
  });

  return res.json(messages);
};

export const postMessageController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageId = Number(req.params.id);
  if (!Number.isInteger(pageId)) {
    return res.status(400).json({ error: "Invalid page id" });
  }

  const content =
    typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, section: { repo: { userId: Number(userId) } } },
    include: { section: { include: { repo: true } } },
  });

  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }

  try {
    // Prior conversation for this page, oldest first — gives the model memory
    // of earlier turns in this page's chat.
    const priorMessages = await prisma.message.findMany({
      where: { pageId, userId: Number(userId) },
      orderBy: { createdAt: "asc" },
    });

    let sourceFiles: string[] = [];
    try {
      sourceFiles = JSON.parse(page.sourceFiles);
    } catch {
      sourceFiles = [];
    }

    const { owner, name, sha } = page.section.repo;

    const fileContents = await fetchFilesContents(
      owner,
      name,
      sha,
      sourceFiles,
    );
    const fileBlocks = Object.entries(fileContents)
      .map(([path, code]) => `--- ${path} ---\n${code}`)
      .join("\n\n");

    const systemPrompt = `You are answering questions about a specific documentation page for the repo ${owner}/${name}.

       Page title: ${page.title}

       Generated documentation for this page:
       ${page.markdown}

       Raw source files this page is based on:
       ${fileBlocks || "(no source file contents available)"}

       Answer the user's question clearly and specifically, grounding your answer in the above content. If the question can't be answered from this page's content, say so rather than guessing.`;

    const conversation = priorMessages.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    );

    const model = getModel();
    const response = await callWithRateLimit(() =>
      model.invoke([
        new SystemMessage(systemPrompt),
        ...conversation,
        new HumanMessage(content),
      ]),
    );

    const replyText =
      typeof response.content === "string"
        ? response.content
        : response.content
            .map((block: any) => (block.type === "text" ? block.text : ""))
            .join("");

    await prisma.message.create({
      data: { pageId, userId: Number(userId), role: "user", content },
    });
    const assistantMessage = await prisma.message.create({
      data: {
        pageId,
        userId: Number(userId),
        role: "assistant",
        content: replyText,
      },
    });

    return res.status(201).json({
      id: assistantMessage.id,
      role: "assistant",
      content: replyText,
      createdAt: assistantMessage.createdAt,
    });
  } catch (err) {
    console.error(`Chat message failed for page ${pageId}:`, err);
    return res.status(500).json({ error: "Failed to generate a response" });
  }
};
