import "reflect-metadata"
import request from "supertest"
import { emailStub } from "../../helpers/stubs/email.stub"
import { truncateAll } from "../../helpers/db"

jest.mock("../../../src/lib/email/init", () => ({
    emailProvider: emailStub,
}))

import { createApp } from "../../../src/app"
import { db } from "../../../src/lib/knex/knex"
import { hashPassword } from "../../../src/app/auth/utils"
import { randomUUID } from "crypto";

const app = createApp()

describe("POST /api/v1/auth/forget-password", () => {
    /// AAA pattern: Arrange: data, Act: action, Assert: result
    beforeEach(async () => {
        await truncateAll()
        emailStub.reset()
    })

    it("should send email to reset password", async () => {
        const now = new Date()
        const password = "password"
        const hashedPassword = await hashPassword(password)

        await db("users").insert({
            email: "test@test.com",
            phone: "123456789",
            name: "test",
            system_role: "customer",
            password_hash: hashedPassword,
            created_at: now,
            updated_at: now
        })

        const res = await request(app)
            .post("/api/v1/auth/forget-password")
            .set("Content-Type", "application/json")
            .set("Idempotency-Key", randomUUID())
            .send({ email: "test@test.com" });

        expect(res.statusCode).toBe(200)
        const resetCount = await db("password_resets").count("* as n").first()
        expect(Number(resetCount?.n)).toBe(1)

        expect(emailStub.sent.length).toBe(1)
        expect(emailStub.sent[0].to).toBe("test@test.com")
    })
})