import { Router } from "express";
import { authenticate } from "../../common/auth/middleware/guard";
import { branchController } from "./controller/branch.controller";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../common/auth/middleware/rbac";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearbyBranches);

branchRouter.get(
    '/branches/:branchId',
    authenticate,
    requireBranchAccess('branchId'),
    branchController.findBranchById
);

branchRouter.patch(
    '/branches/:branchId',
    authenticate,
    requireBranchAccess('branchId'),
    branchController.updateBranchDetails
);

branchRouter.patch('/branches/:branchId/status', authenticate, branchController.updateBranchStatus);

branchRouter.get(
    '/restaurants/:restaurantId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    branchController.listBranchesByRestaurantId
);

branchRouter.post(
    '/restaurants/:restaurantId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:branch', action: 'create' }),
    branchController.createBranch
);
