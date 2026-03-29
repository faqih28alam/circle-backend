// src/__tests__/follow.test.ts

import request from "supertest";
import app from "../App";
import { prisma } from "../connection/client";

// -------------------------------------------------------
// SETUP & TEARDOWN
// -------------------------------------------------------

let tokenA: string; // user A — the one who follows
let tokenB: string; // user B — the one being followed
let userBId: number;

beforeAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
        where: { email: { in: ["followA@jest.com", "followB@jest.com"] } },
    });

    // Register user A
    await request(app)
        .post("/api/register")
        .field("username", "followuserA")
        .field("full_name", "Follow User A")
        .field("email", "followA@jest.com")
        .field("password", "password123");

    // Register user B
    const registerB = await request(app)
        .post("/api/register")
        .field("username", "followuserB")
        .field("full_name", "Follow User B")
        .field("email", "followB@jest.com")
        .field("password", "password123");

    userBId = registerB.body.user.id;

    // Login user A
    const loginA = await request(app)
        .post("/api/login")
        .send({ email: "followA@jest.com", password: "password123" });
    tokenA = loginA.body.token;

    // Login user B
    const loginB = await request(app)
        .post("/api/login")
        .send({ email: "followB@jest.com", password: "password123" });
    tokenB = loginB.body.token;
});

afterAll(async () => {
    // Clean up following records and users
    const users = await prisma.user.findMany({
        where: { email: { in: ["followA@jest.com", "followB@jest.com"] } },
        select: { id: true },
    });
    const ids = users.map((u) => u.id);

    await prisma.following.deleteMany({
        where: {
            OR: [
                { follower_id: { in: ids } },
                { following_id: { in: ids } },
            ],
        },
    });

    await prisma.user.deleteMany({
        where: { email: { in: ["followA@jest.com", "followB@jest.com"] } },
    });

    await prisma.$disconnect();
});

// -------------------------------------------------------
// POST /api/follows/:id — Follow a user
// -------------------------------------------------------

describe("POST /api/follows/:id", () => {

    it("should follow a user successfully", async () => {
        const res = await request(app)
            .post(`/api/follows/${userBId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Followed successfully");
    });

    it("should fail if already following", async () => {
        const res = await request(app)
            .post(`/api/follows/${userBId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Already following this user");
    });

    it("should fail if following yourself", async () => {
        // Get user A's id
        const loginRes = await request(app)
            .post("/api/login")
            .send({ email: "followA@jest.com", password: "password123" });

        const userAId = loginRes.body.user.id;

        const res = await request(app)
            .post(`/api/follows/${userAId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(500);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).post(`/api/follows/${userBId}`);
        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/follows/followers
// -------------------------------------------------------

describe("GET /api/follows/followers", () => {

    it("should return list of followers", async () => {
        // User B should have user A as a follower
        const res = await request(app)
            .get("/api/follows/followers")
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array if no followers", async () => {
        // User A has no followers
        const res = await request(app)
            .get("/api/follows/followers")
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/follows/followers");
        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/follows/following
// -------------------------------------------------------

describe("GET /api/follows/following", () => {

    it("should return list of users being followed", async () => {
        // User A is following user B
        const res = await request(app)
            .get("/api/follows/following")
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array if not following anyone", async () => {
        // User B is not following anyone
        const res = await request(app)
            .get("/api/follows/following")
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/follows/following");
        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/follows/count
// -------------------------------------------------------

describe("GET /api/follows/count", () => {

    it("should return correct follow counts", async () => {
        // User A is following 1, has 0 followers
        const res = await request(app)
            .get("/api/follows/count")
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("followersCount");
        expect(res.body.data).toHaveProperty("followingCount");
        expect(res.body.data.followingCount).toBe(1);
        expect(res.body.data.followersCount).toBe(0);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/follows/count");
        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/follows/suggested
// -------------------------------------------------------

describe("GET /api/follows/suggested", () => {

    it("should not include users already followed", async () => {
        const res = await request(app)
            .get("/api/follows/suggested")
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);

        // User B should NOT be in suggestions since A already follows B
        const suggestedIds = res.body.data.map((u: any) => u.id);
        expect(suggestedIds).not.toContain(userBId);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/follows/suggested");
        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// DELETE /api/follows/:id — Unfollow a user
// -------------------------------------------------------

describe("DELETE /api/follows/:id", () => {

    it("should unfollow a user successfully", async () => {
        const res = await request(app)
            .delete(`/api/follows/${userBId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Unfollowed successfully");
    });

    it("should fail if not following the user", async () => {
        // Already unfollowed, trying again
        const res = await request(app)
            .delete(`/api/follows/${userBId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(500);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).delete(`/api/follows/${userBId}`);
        expect(res.status).toBe(401);
    });

});