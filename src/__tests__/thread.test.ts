// src/__tests__/thread.test.ts

import request from "supertest";
import app from "../App";
import { prisma } from "../connection/client";

// -------------------------------------------------------
// SETUP & TEARDOWN
// -------------------------------------------------------

let token: string;
let threadId: number;

beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({ where: { email: "threadtest@jest.com" } });

    // Register + login to get token
    await request(app)
        .post("/api/register")
        .field("username", "threadtestuser")
        .field("full_name", "Thread Test")
        .field("email", "threadtest@jest.com")
        .field("password", "password123");

    const loginRes = await request(app)
        .post("/api/login")
        .send({ email: "threadtest@jest.com", password: "password123" });

    token = loginRes.body.token;
});

afterAll(async () => {
    // Clean up all threads and user created during tests
    await prisma.thread.deleteMany({
        where: { author: { email: "threadtest@jest.com" } },
    });
    await prisma.user.deleteMany({ where: { email: "threadtest@jest.com" } });
    await prisma.$disconnect();
});

// -------------------------------------------------------
// GET /api/threads
// -------------------------------------------------------

describe("GET /api/threads", () => {

    it("should return list of threads when authenticated", async () => {
        const res = await request(app)
            .get("/api/threads")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/threads");

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// POST /api/thread
// -------------------------------------------------------

describe("POST /api/thread", () => {

    it("should create a thread successfully", async () => {
        const res = await request(app)
            .post("/api/thread")
            .set("Authorization", `Bearer ${token}`)
            .field("content", "Hello from Jest test!");

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.content).toBe("Hello from Jest test!");

        // Save threadId for later tests
        threadId = res.body.data.id;
    });

    it("should fail if content is empty", async () => {
        const res = await request(app)
            .post("/api/thread")
            .set("Authorization", `Bearer ${token}`)
            .field("content", "");

        expect(res.status).toBe(400);
    });

    it("should fail if content exceeds 500 characters", async () => {
        const res = await request(app)
            .post("/api/thread")
            .set("Authorization", `Bearer ${token}`)
            .field("content", "a".repeat(501));

        expect(res.status).toBe(400);
    });

    it("should fail if not authenticated", async () => {
        const res = await request(app)
            .post("/api/thread")
            .field("content", "No auth thread");

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/thread/:id
// -------------------------------------------------------

describe("GET /api/thread/:id", () => {

    it("should return thread detail by id", async () => {
        const res = await request(app)
            .get(`/api/thread/${threadId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("id", threadId);
        expect(res.body.data).toHaveProperty("content");
        expect(res.body.data).toHaveProperty("author");
        expect(res.body.data).toHaveProperty("likes_count");
        expect(res.body.data).toHaveProperty("isLiked");
    });

    it("should return 404 for non-existent thread", async () => {
        const res = await request(app)
            .get("/api/thread/999999")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get(`/api/thread/${threadId}`);

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// GET /api/thread/:id/replies
// -------------------------------------------------------

describe("GET /api/thread/:id/replies", () => {

    it("should return replies for a thread", async () => {
        const res = await request(app)
            .get(`/api/thread/${threadId}/replies`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("replies");
        expect(Array.isArray(res.body.data.replies)).toBe(true);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app)
            .get(`/api/thread/${threadId}/replies`);

        expect(res.status).toBe(401);
    });

});

// -------------------------------------------------------
// DELETE /api/thread/:id
// -------------------------------------------------------

describe("DELETE /api/thread/:id", () => {

    it("should delete a thread successfully", async () => {
        // Create a thread to delete
        const createRes = await request(app)
            .post("/api/thread")
            .set("Authorization", `Bearer ${token}`)
            .field("content", "Thread to be deleted");

        const deleteId = createRes.body.data.id;

        const res = await request(app)
            .delete(`/api/thread/${deleteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).delete(`/api/thread/${threadId}`);

        expect(res.status).toBe(401);
    });

});