// src/__tests__/jwt.test.ts

import { generateToken, verifyToken } from "../utils/jwt";

// GROUP: generateToken
describe("generateToken", () => {

    it("should return a string", () => {
        const token = generateToken({ id: 1, username: "faqih" });
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
    });

    it("should contain the correct payload", () => {
        const payload = { id: 1, username: "faqih" };
        const token = generateToken(payload);
        const decoded = verifyToken(token) as any;

        expect(decoded.id).toBe(1);
        expect(decoded.username).toBe("faqih");
    });

});

// GROUP: verifyToken
describe("verifyToken", () => {

    it("should return payload for a valid token", () => {
        const payload = { id: 1, username: "faqih" };
        const token = generateToken(payload);
        const result = verifyToken(token) as any;

        expect(result).not.toBeNull();
        expect(result.id).toBe(1);
    });

    it("should return null for an invalid token", () => {
        const result = verifyToken("this.is.invalid");
        expect(result).toBeNull();
    });

    it("should return null for an empty string", () => {
        const result = verifyToken("");
        expect(result).toBeNull();
    });

});