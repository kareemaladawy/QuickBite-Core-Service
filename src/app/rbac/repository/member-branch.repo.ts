import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";

export async function setMemberBranches(memberId: number, branchIds: number[], transaction: Knex = db): Promise<void> {
    await transaction("member_branch").where("member_id", memberId).delete();

    if (branchIds.length > 0) {
        await transaction("member_branch")
            .insert(branchIds.map((branchId) => ({
                member_id: memberId,
                branch_id: branchId
            })));
    }
}

export async function addMemberBranch(memberId: number, branchId: number, transaction: Knex = db): Promise<void> {
    await transaction("member_branch").insert({
        member_id: memberId,
        branch_id: branchId
    });
}

export async function findMemberBranchIdsByMemberId(memberId: number, transaction: Knex = db): Promise<number[]> {
    const rows = await transaction("member_branch").where("member_id", memberId).select("branch_id");
    return rows.map((row: any) => Number(row.branch_id));
}

export async function findMemberBranchIdsByUserId(userId: number, transaction: Knex = db): Promise<number[]> {
    const rows = await transaction("member_branch as mb")
        .join("restaurant_members as rm", "mb.member_id", "rm.id")
        .where("rm.user_id", userId)
        .select("mb.branch_id");

    return rows.map((row: any) => Number(row.branch_id));
}

export async function countBranchesByIdsAndRestaurant(branchIds: number[], restaurantId: number): Promise<number> {
    const rows = await db("branches").whereIn("id", branchIds).where("restaurant_id", restaurantId).select("id");
    return rows.length;
}