import { NextFunction, Request, Response } from "express";
import { branchService, BranchService } from "../service/branch.service";
import { restaurantService, RestaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { validateBody } from "../../../lib/validation/validate";
import { UnauthorizedError } from "../errors";
import { setMemberBranches } from "../../rbac/repository/member-branch.repo";

export class BranchController {
    constructor(
        private readonly branchService: BranchService,
        private readonly restaurantService: RestaurantService
    ) { }

    listBranchesByRestaurantId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.branchService.listBranchesByRestaurantId(
                Number(req.params.restaurantId)
            );

            return res.status(200).json({
                data: branches
            });
        } catch (error) {
            next(error);
        }
    }

    findBranchById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branch = await this.branchService.findBranchById(
                Number(req.params.branchId)
            );

            return res.status(200).json({
                data: branch
            });
        } catch (error) {
            next(error);
        }
    }

    findNearbyBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.branchService.findNearbyBranches(
                Number(req.query.lat),
                Number(req.query.long),
            );

            return res.status(200).json({
                data: branches
            });
        } catch (error) {
            next(error);
        }
    }

    createBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = Number(req.user?.userId);
            const userRole = req.user?.role as SystemRole;
            const restaurantId = Number(req.params.restaurantId);
            const restaurant = await this.restaurantService.findRestaurantById(restaurantId);

            if (!(userRole == SystemRole.RESTAURANT_USER && userId == restaurant.ownerId
                || userRole == SystemRole.SYSTEM_ADMIN)
            ) {
                throw UnauthorizedError;
            }

            const validated = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.createBranch(restaurantId, userId, validated);

            res.status(201).json(branch);
        } catch (error) {
            next(error);
        }
    };

    updateBranchDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = Number(req.user?.userId);
            const userRole = req.user?.role as SystemRole;
            const branchId = Number(req.params.branchId);
            const branch = await this.branchService.findBranchById(branchId);
            const restaurant = await this.restaurantService.findRestaurantById(branch.restaurantId);

            if (!(userRole == SystemRole.RESTAURANT_USER && userId == restaurant.ownerId
                || userRole == SystemRole.SYSTEM_ADMIN)
            ) {
                throw UnauthorizedError;
            }

            const validated = await validateBody(UpdateBranchDetailsDTO, req.body);
            await this.branchService.updateBranchDetails(branchId, validated);

            res.status(200).send();
        } catch (error) {
            next(error);
        }
    };

    updateBranchStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user?.role as SystemRole;
            const branchId = Number(req.params.branchId);

            if (userRole != SystemRole.SYSTEM_ADMIN) {
                throw UnauthorizedError;
            }

            const validated = await validateBody(UpdateBranchStatusDTO, req.body);
            await this.branchService.updateBranchStatus(branchId, validated);

            res.status(200).send();
        } catch (error) {
            next(error);
        }
    };
}

export const branchController = new BranchController(branchService, restaurantService);