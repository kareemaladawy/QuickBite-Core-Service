import { Knex } from "knex";
import { db } from "../../../common/knex/knex";
import { hashPassword } from "../../auth/utils";
import { User } from "../entity/user.entity";

const userColumns = [
    "id",
    "name",
    "email",
    "phone",
    "password_hash",
    "system_role",
    "created_at",
    "updated_at",
    "deleted_at"
];

function toEntity(row: any): User {
    return new User({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        passwordHash: row.password_hash,
        systemRole: row.system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    });
}

export async function userExistsByEmailOrPhone(email: string, phone: string): Promise<boolean> {
    const result = await db.raw(`select exists (select 1 from users where email = ? or phone = ?) as "exists"`, [
        email,
        phone
    ]);

    return result.rows[0].exists;
}

export async function userExistsByEmail(email: string): Promise<boolean> {
    const result = await db.raw(`select exists (select 1 from users where email = ?) as "exists"`, [
        email,
    ]);

    return result.rows[0].exists;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const row = await db("users").select(...userColumns).where({ email: email }).first();

    return row ? toEntity(row) : undefined;
}

export async function findUserById(id: number): Promise<User | undefined> {
    const row = await db("users").select(...userColumns).where({ id: id }).first();

    return row ? toEntity(row) : undefined;
}

export async function createUser(user: User, transaction: Knex = db): Promise<User> {
    const now = new Date();
    const [row] = await transaction("users").insert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password_hash: user.passwordHash,
        system_role: user.systemRole,
        created_at: now,
        updated_at: now,
    }).returning(userColumns);

    return toEntity(row);
}

export async function updateUserPassword(id: number, password: string): Promise<void> {
    await db("users").where("id", id).update({
        password_hash: await hashPassword(password)
    });
}

export async function updateUserProfile(id: number, data: Object): Promise<User> {
    const [row] = await db("users").where("id", id).update({
        ...data,
        updated_at: new Date()
    }).returning(userColumns);

    return toEntity(row);
}