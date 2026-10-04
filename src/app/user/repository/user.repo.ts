import { db } from "../../../common/knex/knex";
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

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const row = await db("users").select(...userColumns).where({ email }).first();

    console.log(row);
    return row ? toEntity(row) : undefined;
}

export async function createUser(user: User): Promise<User> {
    const now = new Date();
    const [row] = await db("users").insert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password_hash: user.passwordHash,
        system_role: user.systemRole,
        created_at: now,
        updated_at: now,
    }).returning(userColumns);

    console.log(row);
    return toEntity(row);
}