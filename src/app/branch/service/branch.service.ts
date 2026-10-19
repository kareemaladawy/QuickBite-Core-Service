import { inject, injectable } from "tsyringe";
import { NoMemberProfileFound } from "../../auth/errors";
import { addMemberBranch } from "../../rbac/repository/member-branch.repo";
import { findRestaurantMemberWithRoleName } from "../../rbac/repository/restaurant-member.repo";
import { CreateBranchDTO, UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { BranchNotFoundError } from "../errors";
import { createBranch, findBranchById, findBranchWithRestaurantStatusById, findNearbyBranches, listBranchesByRestaurantId, updateBranchDetails, updateBranchStatus, BranchWithRestaurantStatusRow } from "../repository/branch.repo";
import { TOKENS } from "../../../lib/di/tokens";
import { MemberBranchCacheService } from "../../rbac/service/member-branch-cache.service";
import { NearbyBranchRow } from "../types";
import { db } from "../../../lib/knex/knex";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { CoreEventType } from "../../../lib/events/event-types";

@injectable()
export class BranchService {
    constructor(
        @inject(TOKENS.MemberBranchCacheService) private readonly memberBranchCacheService: MemberBranchCacheService
    ) { }

    createBranch: any = async (restaurantId: number, ownerId: number, data: CreateBranchDTO): Promise<Branch> => {
        const now = new Date();
        const branch = await createBranch(new Branch({
            restaurantId: restaurantId,
            label: data.label,
            addressText: data.addressText,
            countryCode: data.countryCode,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
            deliveryFee: data.deliveryFee,
            lat: data.lat,
            long: data.long,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            acceptsOrders: true,
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }));

        const memberData = await findRestaurantMemberWithRoleName(Number(ownerId));

        if (!memberData.member) {
            throw NoMemberProfileFound;
        }

        await addMemberBranch(memberData.member.id, branch.id);
        this.memberBranchCacheService.invalidate(ownerId);

        return branch;
    }

    updateBranchDetails: any = async (branchId: number, data: UpdateBranchDetailsDTO): Promise<void> => {
        const transaction = await db.transaction();

        try {
            await updateBranchDetails(branchId, {
                label: data.label,
                addressText: data.addressText,
                currency: data.currency,
                deliveryRadius: data.deliveryRadius,
                deliveryFee: data.deliveryFee,
                opensAt: data.opensAt,
                closesAt: data.closesAt,
                acceptsOrders: data.acceptsOrders,
            }, transaction);

            await insertOutboxEvent(transaction, {
                aggregateType: "branch",
                aggregateId: branchId,
                eventType: data.acceptsOrders === false ? CoreEventType.BRANCH_DEACTIVATED : CoreEventType.BRANCH_UPDATED,
                payload: { branchId },
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    updateBranchStatus: any = async (branchId: number, data: UpdateBranchStatusDTO): Promise<void> => {
        const transaction = await db.transaction();

        try {
            await updateBranchStatus(branchId, {
                isActive: data.isActive,
                commissionPercentage: data.commissionPercentage
            }, transaction);

            await insertOutboxEvent(transaction, {
                aggregateType: "branch",
                aggregateId: branchId,
                eventType: data.isActive === false ? CoreEventType.BRANCH_DEACTIVATED : CoreEventType.BRANCH_UPDATED,
                payload: { branchId },
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    findNearbyBranches: any = async (lat: number, long: number): Promise<NearbyBranchRow[]> => {
        const branches = await findNearbyBranches(lat, long);

        return branches;
    }

    listBranchesByRestaurantId: any = async (restaurantId: number): Promise<Branch[]> => {
        const branches = await listBranchesByRestaurantId(restaurantId);

        return branches;
    }

    findBranchById: any = async (id: number): Promise<Branch> => {
        const branch = await findBranchById(id);

        if (!branch) {
            throw BranchNotFoundError;
        }

        return branch;
    }

    findBranchWithRestaurantStatusById: any = async (id: number): Promise<BranchWithRestaurantStatusRow> => {
        const row = await findBranchWithRestaurantStatusById(id);

        if (!row) {
            throw BranchNotFoundError;
        }

        return row;
    }
}