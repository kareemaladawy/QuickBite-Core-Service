import { hashPassword, comparePasswordHash } from "../../../src/app/auth/utils";

describe("Compare Password", () => {
    it("should match password with hashed password", async () => {
        const password = "password";
        const hashedPassword = await hashPassword(password);
        expect(await comparePasswordHash(password, hashedPassword)).toBe(true);
    });
});