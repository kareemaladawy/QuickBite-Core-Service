import { db } from "../../../lib/knex/knex";
import { Role } from "../entity/role.entity";

const roleColumns = [
    "id",
    "name",
    "display_name",
    "description",
    "created_at",
    "updated_at",
];

function toEntity(row: any): Role {
    return new Role({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function findRoleIdByName(name: string): Promise<number> {
    const row = await db("roles").where("name", name).select("id").first();

    return row.id;
}