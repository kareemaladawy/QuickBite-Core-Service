import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/middleware/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { BranchController } from "./controller/branch.controller";
import { withCache } from "../../lib/cache/middleware/withCache";
import { hours } from "../../pkg/utils/time";

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);

branchRouter.get(
    '/branches/nearby',
    // withCache(hours(1)),
    branchController.findNearbyBranches
);

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
    rbac({ resource: 'core:branch', action: 'update' }),
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
