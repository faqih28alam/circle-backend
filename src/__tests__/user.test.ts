// src/__tests__/user.test.ts

import request from "supertest";
import app from "../App";
import { prisma } from "../connection/client";

// -------------------------------------------------------
// SETUP & TEARDOWN
// -------------------------------------------------------

let token: string;
let testUsername: string = "searchjestuser";

beforeAll(async () => {
    // Delete threads first, then user (foreign key order)
    await prisma.thread.deleteMany({
        where: { author: { email: "searchtest@jest.com" } },
    });
    await prisma.user.deleteMany({
        where: { email: "searchtest@jest.com" },
    });

    // Register test user
    await request(app)
        .post("/api/register")
        .field("username", testUsername)
        .field("full_name", "Search Jest User")
        .field("email", "searchtest@jest.com")
        .field("password", "password123")
        .field("bio", "test bio for search");

    // Login to get token
    const loginRes = await request(app)
        .post("/api/login")
        .send({ email: "searchtest@jest.com", password: "password123" });

    token = loginRes.body.token;
});

afterAll(async () => {
    // Delete threads first (foreign key constraint)
    await prisma.thread.deleteMany({
        where: { author: { email: "searchtest@jest.com" } },
    });
    await prisma.user.deleteMany({
        where: { email: "searchtest@jest.com" },
    });
    await prisma.$disconnect();
});

// -------------------------------------------------------
// GET /api/search?q=
// -------------------------------------------------------

describe("GET /api/search", () => {

    it("should return users matching the query by username", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "searchjest" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);

        // Check returned user has correct fields
        const user = res.body.data[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("full_name");
        expect(user).toHaveProperty("isFollowing");
    });

    it("should return users matching the query by full_name", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "Search Jest" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "SEARCHJEST" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "xyznotexist99999" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it("should return 400 if query is empty", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 if query param is missing", async () => {
        const res = await request(app)
            .get("/api/search")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "searchjest" });

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/users/:username
// -------------------------------------------------------

describe("GET /api/users/:username", () => {

    it("should return user profile by username", async () => {
        const res = await request(app)
            .get(`/api/users/${testUsername}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("username", testUsername);
        expect(res.body.data).toHaveProperty("full_name");
        expect(res.body.data).toHaveProperty("followersCount");
        expect(res.body.data).toHaveProperty("followingCount");
        expect(res.body.data).toHaveProperty("isFollowing");
        expect(res.body.data).toHaveProperty("isOwnProfile");
    });

    it("should return isOwnProfile true for own profile", async () => {
        const res = await request(app)
            .get(`/api/users/${testUsername}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.isOwnProfile).toBe(true);
    });

    it("should return 404 for non-existent username", async () => {
        const res = await request(app)
            .get("/api/users/xyznotexist99999")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app)
            .get(`/api/users/${testUsername}`);

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/users/:username/threads
// -------------------------------------------------------

describe("GET /api/users/:username/threads", () => {

    it("should return threads for a user", async () => {
        const res = await request(app)
            .get(`/api/users/${testUsername}/threads`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return threads with correct fields", async () => {
        // Create a thread first
        await request(app)
            .post("/api/thread")
            .set("Authorization", `Bearer ${token}`)
            .field("content", "Test thread for profile");

        const res = await request(app)
            .get(`/api/users/${testUsername}/threads`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);

        const thread = res.body.data[0];
        expect(thread).toHaveProperty("id");
        expect(thread).toHaveProperty("content");
        expect(thread).toHaveProperty("likes_count");
        expect(thread).toHaveProperty("isLiked");
        expect(thread).toHaveProperty("author");
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app)
            .get(`/api/users/${testUsername}/threads`);

        expect(res.status).toBe(401);
    });

});