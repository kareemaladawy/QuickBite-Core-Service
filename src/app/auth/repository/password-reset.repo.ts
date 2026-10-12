import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { PasswordReset } from "../entity/password-reset.entity";

const passwordResetColumns = [
    "id",
    "user_id",
    "otp_hash",
    "expires_at",
    "consumed_at",
    "created_at",
];

function toEntity(row: any): PasswordReset {
    return new PasswordReset({
        id: row?.id,
        userId: row.user_id,
        otpHash: row.otp_hash,
        expiresAt: row.expires_at,
        consumedAt: row.consumed_at,
        createdAt: row.created_at,
    });
}

export async function createPasswordReset(passwordReset: Partial<PasswordReset>, transaction: Knex = db): Promise<void> {
    await transaction("password_resets").insert({
        user_id: passwordReset.userId,
        otp_hash: passwordReset.otpHash,
        expires_at: passwordReset.expiresAt,
        created_at: new Date(),
    })
}

export async function findLatestPasswordResetAttemptByUserId(userId: number): Promise<PasswordReset | undefined> {
    const row = await db("password_resets").
        orderBy("id", "desc").
        where("user_id", userId).
        whereNull("consumed_at").
        first();

    return row ? toEntity(row) : undefined;
}

export async function setPasswordResetConsumedAt(id: number) {
    await db("password_resets").where("id", id).update({
        consumed_at: new Date()
    });
}
