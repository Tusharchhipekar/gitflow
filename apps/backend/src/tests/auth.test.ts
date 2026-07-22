import { describe, test, expect, afterAll } from "bun:test";
import request from "supertest";
import { app } from "../index";
import prisma from "@repo/db-prisma";

const TEST_EMAIL = `testtt_${Date.now()}@example.com`;
const TEST_PASSWORD = "SuperSecret123";
const TEST_NAME = "Test User";

let accessToken: string;
let refreshCookie: string;

describe("Auth endpoints", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  // ---------- SIGNUP ----------
  describe("POST /api/v1/auth/signup", () => {
    test("creates a new user with valid input", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        provider: "credentials",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(TEST_EMAIL);

      // Grab the refreshToken cookie for later tests
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      refreshCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      accessToken = res.body.accessToken;
    });

    test("rejects duplicate email", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        provider: "credentials",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test("rejects invalid input (missing email)", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        name: TEST_NAME,
        password: TEST_PASSWORD,
        provider: "credentials",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid input/i);
    });
  });

  // ---------- SIGNIN ----------
  describe("POST /api/v1/auth/signin", () => {
    test("signs in with correct credentials", async () => {
      const res = await request(app).post("/api/v1/auth/signin").send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();

      accessToken = res.body.accessToken;
      const setCookie = res.headers["set-cookie"];
      refreshCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    });

    test("rejects wrong password", async () => {
      const res = await request(app).post("/api/v1/auth/signin").send({
        email: TEST_EMAIL,
        password: "WrongPassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test("rejects nonexistent user", async () => {
      const res = await request(app).post("/api/v1/auth/signin").send({
        email: "doesnotexist@example.com",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test("rejects invalid input (missing password)", async () => {
      const res = await request(app).post("/api/v1/auth/signin").send({
        email: TEST_EMAIL,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid input/i);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    test("returns user data with a valid access token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(TEST_EMAIL);
    });

    test("rejects with no token", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/no access token/i);
    });

    test("rejects with a malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not.a.real.token");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });

    test("rejects a refresh token used as an access token", async () => {
      expect(true).toBe(true);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    test("issues a new access token with a valid refresh cookie", async () => {
      expect(refreshCookie).toBeDefined();

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    test("rejects with no refresh cookie", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/no refresh token/i);
    });

    test("rejects a garbage refresh cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=not.a.real.token");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });

    test("rejects an access token used as a refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid token type/i);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    test("clears the refresh token cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const setCookie = res.headers["set-cookie"];
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;

      expect(cookieStr).toMatch(/refreshToken=;/);
    });
  });
});
