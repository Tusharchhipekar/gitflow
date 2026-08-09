import dotenv from "dotenv";
dotenv.config();

import prisma from "@repo/db-prisma";
import { startIndexing } from "@repo/git-indexing";

// Hardcoded demo account so interviewers can sign in without Google OAuth or
// creating an account — kept in sync with the credentials in
// apps/frontend/src/features/auth/components/AuthForm.tsx.
const DEMO_EMAIL = "demo@gitflow.dev";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo User";

const DEMO_REPO_OWNER = "Tusharchhipekar";
const DEMO_REPO_NAME = "gitflow";

async function main() {
  const hashedPassword = await Bun.password.hash(DEMO_PASSWORD, {
    algorithm: "bcrypt",
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: hashedPassword },
    create: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      password: hashedPassword,
    },
  });
  console.log(`Demo user ready: ${user.email} (id: ${user.id})`);

  const existingRepo = await prisma.repo.findUnique({
    where: {
      userId_owner_name: {
        userId: user.id,
        owner: DEMO_REPO_OWNER,
        name: DEMO_REPO_NAME,
      },
    },
  });

  if (existingRepo && existingRepo.status === "ready") {
    console.log(
      `Demo repo already indexed: ${DEMO_REPO_OWNER}/${DEMO_REPO_NAME} (id: ${existingRepo.id})`,
    );
    return;
  }

  const repo =
    existingRepo ??
    (await prisma.repo.create({
      data: {
        userId: user.id,
        owner: DEMO_REPO_OWNER,
        name: DEMO_REPO_NAME,
        sha: "pending",
        fileCount: 0,
        truncated: false,
        status: "pending",
      },
    }));

  console.log(
    `Indexing demo repo ${DEMO_REPO_OWNER}/${DEMO_REPO_NAME} (id: ${repo.id})... this calls the real pipeline and can take several minutes.`,
  );
  await startIndexing(user.id, repo.id, DEMO_REPO_OWNER, DEMO_REPO_NAME);

  const finalRepo = await prisma.repo.findUnique({ where: { id: repo.id } });
  console.log(`Demo repo status: ${finalRepo?.status}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
