import type { Request, Response } from "express";
import prisma from "@repo/db-prisma";

// Ownership is checked via the page's section -> repo -> userId chain, so a user can only
// ever fetch pages belonging to their own repos.
export const getPageController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid page id" });
  }

  const page = await prisma.page.findFirst({
    where: {
      id,
      section: {
        repo: {
          userId: Number(userId),
        },
      },
    },
    include: {
      section: {
        include: {
          repo: true,
        },
      },
    },
  });

  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }

  let sourceFiles: string[] = [];
  try {
    sourceFiles = JSON.parse(page.sourceFiles);
  } catch {
    sourceFiles = [];
  }

  return res.json({
    id: page.id,
    slug: page.slug,
    title: page.title,
    order: page.order,
    markdown: page.markdown,
    sourceFiles,
    section: {
      id: page.section.id,
      title: page.section.title,
    },
    repo: {
      id: page.section.repo.id,
      owner: page.section.repo.owner,
      name: page.section.repo.name,
    },
  });
};
