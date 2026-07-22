import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import prisma from "@repo/db-prisma";

const TEST_EMAIL = `section_test_${Date.now()}@example.com`;
const OTHER_EMAIL = `section_other_${Date.now()}@example.com`;
const TEST_PASSWORD = "SuperSecret123";

let app: any;
let accessToken: string;
let otherAccessToken: string;
let repoId: number;

const FAKE_MARKDOWN = `# Fake page

## Overview

This is seeded test content, no LLM was called to produce it.

\`\`\`mermaid
sequenceDiagram
    participant A
    participant B
    A->>B: test call
    B-->>A: test response
\`\`\`
`;

describe("Section endpoints (no LLM/GitHub calls)", () => {
  beforeAll(async () => {
    mock.module("@repo/git-indexing", () => ({
      startIndexing: async () => {},
      indexingUsers: new Set<number>(),
    }));

    ({ app } = await import("../index"));

    const res1 = await request(app).post("/api/v1/auth/signup").send({
      name: "Section Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      provider: "credentials",
    });
    accessToken = res1.body.accessToken;

    const res2 = await request(app).post("/api/v1/auth/signup").send({
      name: "Other User",
      email: OTHER_EMAIL,
      password: TEST_PASSWORD,
      provider: "credentials",
    });
    otherAccessToken = res2.body.accessToken;

    const createRes = await request(app)
      .post("/api/v1/repo/create")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ owner: "seed-owner", name: "seed-repo" });
    repoId = createRes.body.id;

    await prisma.repo.update({
      where: { id: repoId },
      data: { status: "ready", sha: "fake-sha-for-tests" },
    });

    const section = await prisma.section.create({
      data: { repoId, title: "Seeded Section", order: 1 },
    });

    await prisma.page.create({
      data: {
        sectionId: section.id,
        slug: "seeded-page",
        title: "Seeded Page",
        order: 1,
        markdown: FAKE_MARKDOWN,
        sourceFiles: JSON.stringify(["fake-file.js"]),
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL, OTHER_EMAIL] } },
    });
  });

  describe("GET /api/v1/repo/:id/sections", () => {
    test("rejects unauthenticated request", async () => {
      const res = await request(app).get(`/api/v1/repo/${repoId}/sections`);
      expect(res.status).toBe(401);
    });

    test("returns 404 for another user's repo", async () => {
      const res = await request(app)
        .get(`/api/v1/repo/${repoId}/sections`)
        .set("Authorization", `Bearer ${otherAccessToken}`);
      expect(res.status).toBe(404);
    });

    test("returns 400 for a non-numeric repo id", async () => {
      const res = await request(app)
        .get("/api/v1/repo/not-a-number/sections")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });

    test("returns seeded sections with pages, markdown, and a mermaid diagram", async () => {
      const res = await request(app)
        .get(`/api/v1/repo/${repoId}/sections`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.repo.id).toBe(repoId);
      expect(res.body.sections.length).toBe(1);

      const section = res.body.sections[0];
      expect(section.title).toBe("Seeded Section");
      expect(section.pages.length).toBe(1);

      const page = section.pages[0];
      expect(page.title).toBe("Seeded Page");
      expect(page.markdown).toMatch(/```mermaid/);
      expect(Array.isArray(page.sourceFiles)).toBe(true);
      expect(page.sourceFiles).toEqual(["fake-file.js"]);
    });
  });
});
