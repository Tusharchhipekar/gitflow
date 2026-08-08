import prisma from "@repo/db-prisma";
import { fetchRepoTree } from "./github-fetch";
import { planRepo } from "./agent/planing.model";
import { generateRepo } from "./agent/generating.model";

export const indexingUsers = new Set<number>();

export async function startIndexing(
  userId: number,
  repoId: number,
  owner: string,
  name: string,
) {
  indexingUsers.add(userId);

  try {
    await prisma.repo.update({
      where: { id: repoId },
      data: { status: "fetching" },
    });

    const result = await fetchRepoTree(owner, name);

    await prisma.repo.update({
      where: { id: repoId },
      data: {
        sha: result.sha,
        description: result.description,
        fileCount: result.fileCount,
        truncated: result.truncated,
        indexedAt: new Date(),
        status: "planning",
      },
    });

    await planRepo(repoId, result.files);

    await generateRepo(repoId);
  } catch (err) {
    console.error(`Indexing failed for repo ${repoId}:`, err);
    await prisma.repo.update({
      where: { id: repoId },
      data: { status: "failed" },
    });
  } finally {
    indexingUsers.delete(userId);
  }
}
