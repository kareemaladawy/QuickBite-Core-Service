import { injectable } from "tsyringe";
import { NoMemberProfileFound } from "../../auth/errors";
import { addMemberBranch } from "../../rbac/repository/member-branch.repo";
import { findRestaurantMemberWithRoleName } from "../../rbac/repository/restaurant-member.repo";
import { memberBranchCacheService } from "../../rbac/service/member-branch-cache.service";
import { CreateBranchDTO, UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { BranchNotFoundError } from "../errors";
import { createBranch, findBranchById, findNearbyBranches, listBranchesByRestaurantId, updateBranchDetails, updateBranchStatus } from "../repository/branch.repo";

@injectable()
export class BranchService {
    createBranch: any = async (restaurantId: number, ownerId: number, data: CreateBranchDTO): Promise<Branch> => {
        const now = new Date();
        const branch = await createBranch(new Branch({
            restaurantId: restaurantId,
            label: data.label,
            addressText: data.addressText,
            countryCode: data.countryCode,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
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
        memberBranchCacheService.invalidate(ownerId);

        return branch;
    }

    updateBranchDetails: any = async (branchId: number, data: UpdateBranchDetailsDTO): Promise<void> => {
        await updateBranchDetails(branchId, {
            label: data.label,
            addressText: data.addressText,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            acceptsOrders: data.acceptsOrders,
        });
    }

    updateBranchStatus: any = async (branchId: number, data: UpdateBranchStatusDTO): Promise<void> => {
        await updateBranchStatus(branchId, {
            isActive: data.isActive,
            commissionPercentage: data.commissionPercentage
        });
    }

    findNearbyBranches: any = async (lat: number, long: number): Promise<Branch[]> => {
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
}