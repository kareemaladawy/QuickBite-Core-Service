import { Knex } from "knex";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { db } from "../../../common/knex/knex";
import { MemberStatus } from "../enums";
import { UpdateRestaurantMemberDTO } from "../dto/restaurant-member.dto";

const memberColumns = [
    "id",
    "restaurant_id",
    "user_id",
    "role_id",
    "status",
    "created_at",
    "updated_at"
];

function toEntity(row: any): RestaurantMember {
    return new RestaurantMember({
        id: row.id,
        restaurantId: row.restaurant_id,
        userId: row.user_id,
        roleId: row.role_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createRestaurantMember(data: Partial<RestaurantMember>, transaction: Knex = db): Promise<RestaurantMember> {
    const now = new Date();
    const [row] = await transaction("restaurant_members")
        .insert({
            restaurant_id: data.restaurantId,
            user_id: data.userId,
            role_id: data.roleId,
            status: data.status,
            created_at: now,
            updated_at: now,
        })
        .returning(memberColumns);

    return toEntity(row);
}

export async function activateRestaurantMember(userId: number, transaction: Knex = db): Promise<void> {
    await transaction("restaurant_members")
        .where("user_id", userId)
        .update({
            status: MemberStatus.ACTIVE,
            updated_at: new Date()
        });
}

export async function findRestaurantMemberById(memberId: number): Promise<RestaurantMember | undefined> {
    const row = await db("restaurant_members").where("id", memberId).select(memberColumns).first();

    return row ? toEntity(row) : undefined;
}

export async function findRestaurantMemberWithRoleName(userId: number): Promise<{ member: RestaurantMember | undefined, roleName: string | undefined }> {
    const row = await db("restaurant_members as rm")
        .select(
            "rm.id",
            "rm.restaurant_id",
            "rm.role_id",
            "r.name as roleName",
        )
        .leftJoin("roles as r", "rm.role_id", "r.id")
        .where("rm.user_id", userId)
        .andWhere("rm.status", MemberStatus.ACTIVE)
        .first();

    return {
        member: row ? toEntity(row) : undefined,
        roleName: row ? row.roleName : undefined
    };
}

export async function findMembersByRestaurantId(restaurantId: number): Promise<RestaurantMember[]> {
    const rows = await db("restaurant_members as rm")
        .join("users as u", "rm.user_id", "u.id")
        .join("roles as r", "rm.role_id", "r.id")
        .where("restaurant_id", restaurantId)
        .select(
            "rm.id",
            "rm.user_id",
            "rm.status",
            "u.email",
            "u.name",
            "u.phone",
            "r.name as role",
            "r.display_name as roleDisplayName",
        );

    return rows;
}

export async function updateRestaurantMember(memberId: number, data: any, transaction: Knex = db): Promise<void> {
    await transaction("restaurant_members")
        .where("id", memberId)
        .update({
            role_id: data.roleId,
            status: data.status,
            updated_at: new Date()
        });
}

export async function deleteRestaurantMember(memberId: number, transaction: Knex = db): Promise<void> {
    await transaction("restaurant_members")
        .where("id", memberId)
        .delete();
}

