import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/middleware/rbac";
import { requireInternalApiKey } from "../../lib/auth/middleware/api-key";
import { RestaurantMemberController } from "./controller/restaurant-member.controller";
import { TOKENS } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";

export const restaurantMemberRouter = Router();

const restaurantMemberController = container.resolve<RestaurantMemberController>(TOKENS.RestaurantMemberController);

restaurantMemberRouter.get(
    '/internal/rbac/permissions',
    requireInternalApiKey,
    restaurantMemberController.getRolePermissionsInternal
);

restaurantMemberRouter.get(
    '/roles/:roleName/permissions',
    restaurantMemberController.getRolePermissions
);

restaurantMemberRouter.get(
    '/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:member', action: 'read' }),
    restaurantMemberController.listMembers
);

restaurantMemberRouter.post(
    '/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:member', action: 'create' }),
    restaurantMemberController.createMember
);

restaurantMemberRouter.patch(
    '/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:member', action: 'update' }),
    restaurantMemberController.updateMember
);

restaurantMemberRouter.delete(
    '/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:member', action: 'delete' }),
    restaurantMemberController.deleteMember
);

restaurantMemberRouter.put(
    '/restaurants/:restaurantId/members/:memberId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:member', action: 'update' }),
    restaurantMemberController.setMemberBranches
);