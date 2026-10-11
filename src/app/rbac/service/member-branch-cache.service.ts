import { hours } from "../../../common/utils/time";
import { findMemberBranchIdsByUserId } from "../repository/member-branch.repo";

class MemberBranchCacheService {
    private cache: Map<number, { branchIds: number[], cachedAt: number }> = new Map();
    private readonly TTL = hours(1);

    async getBranchIdsByUserId(userId: number): Promise<number[]> {
        const cached = this.cache.get(userId);
        if (cached && cached.cachedAt > Date.now() - this.TTL) {
            return cached.branchIds;
        }

        const branchIds = await findMemberBranchIdsByUserId(userId);
        this.cache.set(userId, { branchIds, cachedAt: Date.now() });

        return branchIds;
    }

    invalidate(userId: number): void {
        this.cache.delete(userId);
    }
}

export const memberBranchCacheService = new MemberBranchCacheService();
