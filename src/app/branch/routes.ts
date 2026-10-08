import { Router } from "express";
import { authenticate } from "../../common/auth/guard";
import { branchController } from "./controller/branch.controller";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearbyBranches);
branchRouter.get('/branches/:branchId', authenticate, branchController.findBranchById);
branchRouter.patch('/branches/:branchId', authenticate, branchController.updateBranchDetails);
branchRouter.patch('/branches/:branchId/status', authenticate, branchController.updateBranchStatus);
branchRouter.get('/restaurants/:restaurantId/branches', authenticate, branchController.listBranchesByRestaurantId);
branchRouter.post('/restaurants/:restaurantId/branches', authenticate, branchController.createBranch);
