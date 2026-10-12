import { NextFunction, Request, Response } from "express";
import { restaurantMemberService, RestaurantMemberService } from "../service/restaurant-member.service";
import { CreateRestaurantMemberDTO, SetRestaurantMemberBranchesDTO, UpdateRestaurantMemberDTO } from "../dto/restaurant-member.dto";
import { validateBody } from "../../../lib/validation/validate";
import { PermissionDeniedError } from "../../../lib/auth/errors";
import { memberBranchCacheService } from "../service/member-branch-cache.service";

export class RestaurantMemberController {
    constructor(private readonly restaurantMemberService: RestaurantMemberService) { }

    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const members = await this.restaurantMemberService.listMembers(Number(req.params.restaurantId));

            return res.status(200).json({ data: members });
        } catch (error) {
            next(error);
        }
    }

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        const validated = await validateBody(CreateRestaurantMemberDTO, req.body);

        if (validated.branchIds && req.user) {
            const userBranchIds = await memberBranchCacheService.getBranchIdsByUserId(req.user.userId);
            const canAccessAllBranchIds = validated.branchIds.every((branchId) => userBranchIds.includes(branchId));

            if (!canAccessAllBranchIds) {
                throw PermissionDeniedError;
            }
        }

        try {
            const member = await this.restaurantMemberService.createMember(
                Number(req.params.restaurantId),
                validated
            );

            return res.status(201).json({ data: member });
        } catch (error) {
            next(error);
        }
    }

    updateMember = async (req: Request, res: Response, next: NextFunction) => {
        const validated = await validateBody(UpdateRestaurantMemberDTO, req.body);

        try {
            await this.restaurantMemberService.updateMember(
                Number(req.params.restaurantId),
                Number(req.params.memberId),
                validated
            );

            return res.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    setMemberBranches = async (req: Request, res: Response, next: NextFunction) => {
        const validated = await validateBody(SetRestaurantMemberBranchesDTO, req.body);

        try {
            await this.restaurantMemberService.setMemberBranches(
                Number(req.params.restaurantId),
                Number(req.params.memberId),
                validated.branchIds
            );

            return res.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    deleteMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.restaurantMemberService.deleteMember(
                Number(req.params.restaurantId),
                Number(req.params.memberId)
            );

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleName = req.params.roleName as string;
            const permissions = await this.restaurantMemberService.getRolePermissions(roleName);

            return res.status(200).json({
                role: roleName,
                permissions
            });
        } catch (error) {
            next(error);
        }
    }
}

export const restaurantMemberController = new RestaurantMemberController(restaurantMemberService);