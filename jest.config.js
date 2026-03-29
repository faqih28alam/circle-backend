module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    collectCoverageFrom: ["src/**/*.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
};