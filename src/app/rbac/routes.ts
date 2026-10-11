import { Router } from "express";
import { authenticate } from "../../common/auth/middleware/guard";
import { restaurantMemberController } from "./controller/restaurant-member.controller";
import { rbac, requireRestaurantMember } from "../../common/auth/middleware/rbac";

export const restaurantMemberRouter = Router();

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