import { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError, PermissionDeniedError } from "../errors";
import { SystemRole } from "../../../app/user/enums";
import { permissionCacheService } from "../../../app/rbac/service/permission-cache.service";
import { InternalServerError } from "../../../app/rbac/errors";
import { memberBranchCacheService } from "../../../app/rbac/service/member-branch-cache.service";

export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean;
    checkOwnership?: boolean;
}

export function rbac(options: RBACOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw NotAuthenticatedError;
            }

            // attribute destructuring
            const { resource, action, allowSystemAdmin = true } = options;

            if (allowSystemAdmin && req.user.role === SystemRole.SYSTEM_ADMIN) {
                return next();
            }

            if (req.user.role == SystemRole.RESTAURANT_USER) {
                const permissions = await permissionCacheService.getPermissionsDetailsByRoleName(req.user.restaurantRole!);

                if (!permissionCacheService.hasPermissions(permissions, resource, action)) {
                    throw PermissionDeniedError;
                }

                return next();
            }

            throw PermissionDeniedError;
        } catch (error) {
            next(error);
        }
    }
}

export function requireRestaurantMember(paramName: string = 'restaurantId') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw NotAuthenticatedError;
            }

            const restaurantId = req.params[paramName];

            if (!restaurantId) {
                throw InternalServerError;
            }

            if (Number(req.user.restaurantId) !== Number(restaurantId)) {
                if (req.user.role === SystemRole.SYSTEM_ADMIN) {
                    return next();
                }

                throw PermissionDeniedError;
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}

export function requireBranchAccess(paramName: string = 'branchId') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw NotAuthenticatedError;
            }

            const branchId = req.params[paramName];

            if (!branchId) {
                throw InternalServerError;
            }

            const branchIds = await memberBranchCacheService.getBranchIdsByUserId(req.user.userId);

            if (!branchIds.includes(Number(branchId))) {
                if (req.user.role === SystemRole.SYSTEM_ADMIN) {
                    return next();
                }
                throw PermissionDeniedError;
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}