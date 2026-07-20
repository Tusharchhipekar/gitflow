import type { Request, Response } from "express";
import prisma from "@repo/db-prisma";

// Returns the full generated docs tree for a repo: sections in order, each
// with its pages in order, including markdown and source file list. This is
// the endpoint a frontend uses to actually render the generated documentation.
export const getRepoSectionsController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid repo id" });
  }

  try {
    // Ownership check first — never expose another user's repo content
    const repo = await prisma.repo.findFirst({
      where: { id, userId: Number(userId) },
    });

    if (!repo) {
      return res.status(404).json({ error: "Repo not found" });
    }

    const sections = await prisma.section.findMany({
      where: { repoId: id },
      orderBy: { order: "asc" },
      include: {
        pages: {
          orderBy: { order: "asc" },
        },
      },
    });

    // sourceFiles is stored as a JSON string (per schema) — parse it back into
    // an array for the response so consumers don't have to JSON.parse it themselves.
    const formatted = sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      pages: section.pages.map((page) => {
        let sourceFiles: string[] = [];
        try {
          sourceFiles = JSON.parse(page.sourceFiles);
        } catch {
          sourceFiles = [];
        }
        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          order: page.order,
          markdown: page.markdown,
          sourceFiles,
        };
      }),
    }));

    return res.json({
      repo: {
        id: repo.id,
        owner: repo.owner,
        name: repo.name,
        status: repo.status,
      },
      sections: formatted,
    });
  } catch (error) {
    console.error(`Error fetching sections for repo ${id}:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
