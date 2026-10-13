import { injectable } from "tsyringe";
import { toMs } from "../../../pkg/utils/time";
import { getPermissionsDetailsByRoleName } from "../repository/permission.repo";

@injectable()
export class PermissionCacheService {
    private cache: Map<string, { permissions: string[], cachedAt: number }> = new Map();
    private readonly TTL = toMs(2, 'h');

    async getPermissionsDetailsByRoleName(roleName: string): Promise<string[]> {
        const cached = this.cache.get(roleName);
        if (cached && cached.cachedAt > Date.now() - this.TTL) {
            return cached.permissions;
        }

        const permissions = await getPermissionsDetailsByRoleName(roleName);
        this.cache.set(roleName, { permissions, cachedAt: Date.now() });

        return permissions;
    }

    hasPermissions(permissions: string[], resource: string, action: string): boolean {
        return permissions.includes(`${resource}:${action}`);
    }
}