import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import prisma from "@repo/db-prisma";

const TEST_EMAIL = `page_test_${Date.now()}@example.com`;
const OTHER_EMAIL = `page_other_${Date.now()}@example.com`;
const TEST_PASSWORD = "SuperSecret123";

let app: any;
let accessToken: string;
let otherAccessToken: string;
let repoId: number;
let pageId: number;

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

describe("Page endpoints (no LLM/GitHub calls)", () => {
  beforeAll(async () => {
    mock.module("@repo/git-indexing", () => ({
      startIndexing: async () => {},
      indexingUsers: new Set<number>(),
    }));

    ({ app } = await import("../index"));

    const res1 = await request(app).post("/api/v1/auth/signup").send({
      name: "Page Test User",
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

    const page = await prisma.page.create({
      data: {
        sectionId: section.id,
        slug: "seeded-page",
        title: "Seeded Page",
        order: 1,
        markdown: FAKE_MARKDOWN,
        sourceFiles: JSON.stringify(["fake-file.js"]),
      },
    });
    pageId = page.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL, OTHER_EMAIL] } },
    });
  });

  describe("GET /api/v1/page/:id", () => {
    test("rejects unauthenticated request", async () => {
      const res = await request(app).get(`/api/v1/page/${pageId}`);
      expect(res.status).toBe(401);
    });

    test("returns 400 for a non-numeric page id", async () => {
      const res = await request(app)
        .get("/api/v1/page/not-a-number")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });

    test("returns 404 for a page id that doesn't exist", async () => {
      const res = await request(app)
        .get("/api/v1/page/999999999")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    });

    test("returns the seeded page with markdown and a mermaid diagram for its owner", async () => {
      const res = await request(app)
        .get(`/api/v1/page/${pageId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(pageId);
      expect(res.body.title).toBe("Seeded Page");
      expect(res.body.markdown).toMatch(/```mermaid/);
      expect(res.body.sourceFiles).toEqual(["fake-file.js"]);
      expect(res.body.repo.id).toBe(repoId);
      expect(res.body.section.title).toBe("Seeded Section");
    });

    test("returns 404 for another user trying to access this page", async () => {
      const res = await request(app)
        .get(`/api/v1/page/${pageId}`)
        .set("Authorization", `Bearer ${otherAccessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
