import type { Request, Response } from "express";
import { Prisma } from "@repo/db-prisma";
import prisma from "@repo/db-prisma";
import { RepoInputSchema, ListReposQuerySchema } from "@repo/types";
import { startIndexing, indexingUsers } from "@repo/git-indexing";

export const createRepoController = async (req: Request, res: Response) => {
  const result = RepoInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const { owner, name } = result.data;

  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (indexingUsers.has(Number(userId))) {
    return res.status(409).json({
      error:
        "You already have an indexing job in progress. Please wait for it to finish.",
    });
  }

  try {
    const repo = await prisma.repo.create({
      data: {
        userId: Number(userId),
        owner,
        name,
        sha: "pending",
        fileCount: 0,
        truncated: false,
        status: "pending",
      },
    });

    startIndexing(Number(userId), repo.id, owner, name).catch((err) => {
      console.error("Background indexing error:", err);
    });
    return res.status(201).json(repo);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: "You've already indexed this repo" });
    }
    console.error("Error creating repo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listReposController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = ListReposQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const { page, limit } = result.data;

  try {
    const repos = await prisma.repo.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json(repos);
  } catch (error) {
    console.error("Error listing repos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRepoController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid repo id" });
  }

  try {
    const repo = await prisma.repo.findFirst({
      where: { id, userId: Number(userId) },
    });

    if (!repo) {
      return res.status(404).json({ error: "Repo not found" });
    }

    return res.json(repo);
  } catch (error) {
    console.error("Error fetching repo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteRepoController = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid repo id" });
  }

  try {
    const repo = await prisma.repo.findFirst({
      where: { id, userId: Number(userId) },
    });

    if (!repo) {
      return res.status(404).json({ error: "Repo not found" });
    }

    await prisma.repo.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting repo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
