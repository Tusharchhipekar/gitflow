import prisma from "@repo/db-prisma";
import { fetchRepoTree } from "./github-fetch";

const indexingUsers = new Set<number>();

export async function startIndexing(
  userId: number,
  repoId: number,
  owner: string,
  name: string,
) {
  if (indexingUsers.has(userId)) {
    throw new Error("You already have an indexing job in progress");
  }
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
        status: "planning", // next step — TOC generation — picks up from here
      },
    });

    // TODO: hand result.files off to the Claude TOC planning step
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
