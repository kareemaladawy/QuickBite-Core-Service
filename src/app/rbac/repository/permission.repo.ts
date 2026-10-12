import { db } from "../../../lib/knex/knex";
import { Permission } from "../entity/permission.entity";

const permissionColumns = [
    "id",
    "resource",
    "action",
    "created_at",
    "updated_at",
];

function toEntity(row: any): Permission {
    return new Permission({
        id: row.id,
        resource: row.resource,
        action: row.action,
        createdAt: row.created_at,
    });
}

export async function getPermissionsDetailsByRoleName(roleName: string): Promise<string[]> {
    const rows = await db("permissions as p")
        .join("role_permission as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName)
        .select(
            "p.id",
            "p.resource",
            "p.action",
        );

    return rows.map((row: any) => {
        const entity = toEntity(row);

        return `${entity.resource}:${entity.action}`;
    });
}

export async function getRolePermissions(roleName: string): Promise<Permission[]> {
    const rows = await db("permissions as p")
        .join("role_permission as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName)
        .select(
            "p.resource",
            "p.action",
        );

    return rows.map(toEntity);
}