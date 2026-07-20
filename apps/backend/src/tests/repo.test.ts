import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import prisma from "@repo/db-prisma";

const TEST_EMAIL = `repo_test_${Date.now()}@example.com`;
const OTHER_EMAIL = `repo_other_${Date.now()}@example.com`;
const TEST_PASSWORD = "SuperSecret123";

const TEST_OWNER = "some-owner";
const TEST_NAME_REPO = "some-repo";

let app: any;
let indexingUsers: Set<number>;
let accessToken: string;
let otherAccessToken: string;
let createdRepoId: number;
let createdUserId: number;

describe("Repo endpoints (no LLM/GitHub calls)", () => {
  beforeAll(async () => {
    mock.module("@repo/git-indexing", () => ({
      startIndexing: async () => {
        // no-op — never calls GitHub or any LLM
      },
      indexingUsers: new Set<number>(),
    }));

    ({ app } = await import("../index"));
    ({ indexingUsers } = await import("@repo/git-indexing"));

    const res1 = await request(app).post("/api/v1/auth/signup").send({
      name: "Repo Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      provider: "credentials",
    });
    accessToken = res1.body.accessToken;
    createdUserId = res1.body.user.id;

    const res2 = await request(app).post("/api/v1/auth/signup").send({
      name: "Other User",
      email: OTHER_EMAIL,
      password: TEST_PASSWORD,
      provider: "credentials",
    });
    otherAccessToken = res2.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL, OTHER_EMAIL] } },
    });
  });

  // ---------- CREATE ----------
  describe("POST /api/v1/repo/create", () => {
    test("rejects unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/v1/repo/create")
        .send({ owner: TEST_OWNER, name: TEST_NAME_REPO });

      expect(res.status).toBe(401);
    });

    test("rejects invalid input (missing name)", async () => {
      const res = await request(app)
        .post("/api/v1/repo/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ owner: TEST_OWNER });

      expect(res.status).toBe(400);
    });

    test("creates a repo with valid input, starts in pending status", async () => {
      const res = await request(app)
        .post("/api/v1/repo/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ owner: TEST_OWNER, name: TEST_NAME_REPO });

      expect(res.status).toBe(201);
      expect(res.body.owner).toBe(TEST_OWNER);
      expect(res.body.name).toBe(TEST_NAME_REPO);
      expect(res.body.status).toBe("pending");

      createdRepoId = res.body.id;
    });

    test("rejects duplicate owner/name for the same user", async () => {
      const res = await request(app)
        .post("/api/v1/repo/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ owner: TEST_OWNER, name: TEST_NAME_REPO });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already indexed/i);
    });

    test("rejects create while user is marked as indexing (concurrency guard)", async () => {
      indexingUsers.add(createdUserId);

      const res = await request(app)
        .post("/api/v1/repo/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ owner: "different-owner", name: "different-repo" });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already have an indexing job/i);

      indexingUsers.delete(createdUserId); // cleanup for later tests
    });
  });

  // ---------- LIST ----------
  describe("GET /api/v1/repo/list", () => {
    test("returns the user's repos", async () => {
      const res = await request(app)
        .get("/api/v1/repo/list")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r: any) => r.id === createdRepoId)).toBe(true);
    });

    test("rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/v1/repo/list");
      expect(res.status).toBe(401);
    });
  });

  // ---------- GET ONE ----------
  describe("GET /api/v1/repo/:id", () => {
    test("returns the repo for its owner", async () => {
      const res = await request(app)
        .get(`/api/v1/repo/${createdRepoId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdRepoId);
    });

    test("returns 404 for another user's repo", async () => {
      const res = await request(app)
        .get(`/api/v1/repo/${createdRepoId}`)
        .set("Authorization", `Bearer ${otherAccessToken}`);

      expect(res.status).toBe(404);
    });

    test("returns 400 for a non-numeric id", async () => {
      const res = await request(app)
        .get("/api/v1/repo/not-a-number")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });

    test("rejects unauthenticated request", async () => {
      const res = await request(app).get(`/api/v1/repo/${createdRepoId}`);
      expect(res.status).toBe(401);
    });
  });

  // ---------- DELETE ----------
  describe("DELETE /api/v1/repo/:id", () => {
    test("returns 404 for another user's repo", async () => {
      const res = await request(app)
        .delete(`/api/v1/repo/${createdRepoId}`)
        .set("Authorization", `Bearer ${otherAccessToken}`);

      expect(res.status).toBe(404);
    });

    test("deletes the repo for its owner", async () => {
      const res = await request(app)
        .delete(`/api/v1/repo/${createdRepoId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });

    test("returns 404 after the repo is already deleted", async () => {
      const res = await request(app)
        .delete(`/api/v1/repo/${createdRepoId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    test("rejects unauthenticated request", async () => {
      const res = await request(app).delete(`/api/v1/repo/${createdRepoId}`);
      expect(res.status).toBe(401);
    });
  });
});
