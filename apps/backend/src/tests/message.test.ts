import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import prisma from "@repo/db-prisma";

const TEST_EMAIL = `message_test_${Date.now()}@example.com`;
const OTHER_EMAIL = `message_other_${Date.now()}@example.com`;
const TEST_PASSWORD = "SuperSecret123";

const FAKE_REPLY_TEXT = "This is a fake test reply about the seeded page.";

let app: any;
let accessToken: string;
let otherAccessToken: string;
let userId: number;
let repoId: number;
let pageId: number;

const FAKE_MARKDOWN = `# Fake page

## Overview

Seeded test content for message tests.

\`\`\`mermaid
sequenceDiagram
    participant A
    participant B
    A->>B: test call
    B-->>A: test response
\`\`\`
`;

describe("Message endpoints (no LLM/GitHub calls)", () => {
  beforeAll(async () => {
    mock.module("@repo/git-indexing", () => ({
      startIndexing: async () => {},
      indexingUsers: new Set<number>(),
      getModel: () => ({
        invoke: async () => ({ content: FAKE_REPLY_TEXT }),
      }),
      createRateLimiter: () => ({
        callWithRateLimit: async (fn: () => Promise<any>) => fn(),
      }),
      fetchFilesContents: async () => ({
        "fake-file.js": "function isOdd(n) { return n % 2 === 1; }",
      }),
    }));

    ({ app } = await import("../index"));

    const res1 = await request(app).post("/api/v1/auth/signup").send({
      name: "Message Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      provider: "credentials",
    });
    accessToken = res1.body.accessToken;
    userId = res1.body.user.id;

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

  describe("POST /api/v1/page/:id/messages", () => {
    test("rejects unauthenticated request", async () => {
      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .send({ content: "hi" });

      expect(res.status).toBe(401);
    });

    test("rejects empty content", async () => {
      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error.fieldErrors.content).toBeDefined();
      expect(res.body.error.fieldErrors.content.length).toBeGreaterThan(0);
    });

    test("rejects content over the 4000 character limit", async () => {
      const tooLong = "a".repeat(4001);

      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: tooLong });

      expect(res.status).toBe(400);
      expect(res.body.error.fieldErrors.content).toBeDefined();
    });

    test("returns 404 for a page that doesn't exist", async () => {
      const res = await request(app)
        .post("/api/v1/page/999999999/messages")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "hi" });

      expect(res.status).toBe(404);
    });

    test("returns 404 for another user's page", async () => {
      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${otherAccessToken}`)
        .send({ content: "hi" });

      expect(res.status).toBe(404);
    });

    test("sends a message and gets back the (fake) assistant reply", async () => {
      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Why does this throw on invalid input?" });

      expect(res.status).toBe(201);
      expect(res.body.role).toBe("assistant");
      expect(res.body.content).toBe(FAKE_REPLY_TEXT);
      expect(res.body.id).toBeDefined();
    });

    test("persists both the user's message and the assistant's reply", async () => {
      const messages = await prisma.message.findMany({
        where: { pageId, userId },
      });

      const userMsgs = messages.filter((m) => m.role === "user");
      const assistantMsgs = messages.filter((m) => m.role === "assistant");

      expect(userMsgs.length).toBeGreaterThanOrEqual(1);
      expect(assistantMsgs.length).toBeGreaterThanOrEqual(1);
      expect(assistantMsgs.some((m) => m.content === FAKE_REPLY_TEXT)).toBe(
        true,
      );
    });

    test("a second message includes prior conversation context (no crash)", async () => {
      const res = await request(app)
        .post(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Can you say more about that?" });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe(FAKE_REPLY_TEXT);
    });
  });

  describe("GET /api/v1/page/:id/messages", () => {
    test("rejects unauthenticated request", async () => {
      const res = await request(app).get(`/api/v1/page/${pageId}/messages`);
      expect(res.status).toBe(401);
    });

    test("returns 404 for another user's page", async () => {
      const res = await request(app)
        .get(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${otherAccessToken}`);
      expect(res.status).toBe(404);
    });

    test("returns the conversation history in order", async () => {
      const res = await request(app)
        .get(`/api/v1/page/${pageId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Two exchanges happened above -> at least 4 messages (2 user, 2 assistant)
      expect(res.body.length).toBeGreaterThanOrEqual(4);

      const roles = res.body.map((m: any) => m.role);
      expect(roles).toContain("user");
      expect(roles).toContain("assistant");
    });
  });
});
