import { NextFunction, Request, Response } from "express";
import { BranchService } from "../service/branch.service";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { BranchResponseDTO, InternalBranchResponseDTO, NearbyBranchResponseDTO } from "../dto/branch.response.dto";
import { validateBody } from "../../../lib/validation/validate";
import { UnauthorizedError } from "../errors";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendCreated, sendSuccess } from "../../../lib/http/response";

@injectable()
export class BranchController {
    constructor(
        @inject(TOKENS.BranchService) private readonly branchService: BranchService,
    ) { }

    listBranchesByRestaurantId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.branchService.listBranchesByRestaurantId(
                Number(req.params.restaurantId)
            );

            sendSuccess(res, branches.map(BranchResponseDTO.from));
        } catch (error) {
            next(error);
        }
    }

    findBranchById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branch = await this.branchService.findBranchById(
                Number(req.params.branchId)
            );

            sendSuccess(res, BranchResponseDTO.from(branch));
        } catch (error) {
            next(error);
        }
    }

    findBranchInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const row = await this.branchService.findBranchWithRestaurantStatusById(
                Number(req.params.branchId)
            );

            sendSuccess(res, InternalBranchResponseDTO.from(row));
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

            sendSuccess(res, branches.map(NearbyBranchResponseDTO.from));
        } catch (error) {
            next(error);
        }
    }

    createBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = Number(req.user?.userId);
            const restaurantId = Number(req.params.restaurantId);
            const validated = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.createBranch(restaurantId, userId, validated);

            sendCreated(res, BranchResponseDTO.from(branch));
        } catch (error) {
            next(error);
        }
    };

    updateBranchDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.branchId);
            const validated = await validateBody(UpdateBranchDetailsDTO, req.body);
            await this.branchService.updateBranchDetails(branchId, validated);

            sendSuccess(res, { message: "Branch details updated" });
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

            sendSuccess(res, { message: "Branch status updated" });
        } catch (error) {
            next(error);
        }
    };
}