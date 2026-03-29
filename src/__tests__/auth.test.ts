// src/__tests__/auth.test.ts

import request from "supertest";
import app from "../App";
import { prisma } from "../connection/client";

// -------------------------------------------------------
// SETUP & TEARDOWN
// -------------------------------------------------------

// Clean up test user before and after all tests
beforeAll(async () => {
    await prisma.user.deleteMany({
        where: { email: "testuser@jest.com" },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: "testuser@jest.com" },
    });
    await prisma.$disconnect();
});

// -------------------------------------------------------
// REGISTER
// -------------------------------------------------------

describe("POST /api/register", () => {

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/register")
            .field("username", "testjest")
            .field("full_name", "Test Jest")
            .field("email", "testuser@jest.com")
            .field("password", "password123")
            .field("bio", "test bio");

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe("testuser@jest.com");
    });

    it("should fail if email already exists", async () => {
        const res = await request(app)
            .post("/api/register")
            .field("username", "testjest2")
            .field("full_name", "Test Jest 2")
            .field("email", "testuser@jest.com") // same email
            .field("password", "password123");

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
    });

    it("should fail if email is invalid", async () => {
        const res = await request(app)
            .post("/api/register")
            .field("username", "testjest3")
            .field("full_name", "Test Jest 3")
            .field("email", "notanemail") // invalid email
            .field("password", "password123");

        expect(res.status).toBe(400);
    });

    it("should fail if password is too short", async () => {
        const res = await request(app)
            .post("/api/register")
            .field("username", "testjest4")
            .field("full_name", "Test Jest 4")
            .field("email", "testjest4@jest.com")
            .field("password", "123"); // too short

        expect(res.status).toBe(400);
    });

});

// -------------------------------------------------------
// LOGIN
// -------------------------------------------------------

describe("POST /api/login", () => {

    it("should login successfully with correct credentials", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "testuser@jest.com",
                password: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe("testuser@jest.com");
    });

    it("should fail with wrong password", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "testuser@jest.com",
                password: "wrongpassword",
            });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message");
    });

    it("should fail with non-existent email", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "nobody@jest.com",
                password: "password123",
            });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message");
    });

});

// -------------------------------------------------------
// CHECK AUTH
// -------------------------------------------------------

describe("GET /api/check", () => {

    let token: string;

    // Login first to get a valid token
    beforeAll(async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "testuser@jest.com",
                password: "password123",
            });
        token = res.body.token;
    });

    it("should return user data with a valid token", async () => {
        const res = await request(app)
            .get("/api/check")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email");
    });

    it("should return 401 with no token", async () => {
        const res = await request(app).get("/api/check");

        expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
        const res = await request(app)
            .get("/api/check")
            .set("Authorization", "Bearer invalidtoken123");

        expect(res.status).toBe(401);
    });

});