import { NextFunction, Request, Response } from "express";
import { RestaurantMemberService } from "../service/restaurant-member.service";
import { CreateRestaurantMemberDTO, SetRestaurantMemberBranchesDTO, UpdateRestaurantMemberDTO } from "../dto/restaurant-member.dto";
import { validateBody } from "../../../lib/validation/validate";
import { PermissionDeniedError } from "../../../lib/auth/errors";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { MemberBranchCacheService } from "../service/member-branch-cache.service";
import { sendCreated, sendNoContent, sendSuccess } from "../../../lib/http/response";

@injectable()
export class RestaurantMemberController {
    constructor(
        @inject(TOKENS.RestaurantMemberService) private readonly restaurantMemberService: RestaurantMemberService,
        @inject(TOKENS.MemberBranchCacheService) private readonly memberBranchCacheService: MemberBranchCacheService
    ) { }

    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const members = await this.restaurantMemberService.listMembers(Number(req.params.restaurantId));

            sendSuccess(res, members);
        } catch (error) {
            next(error);
        }
    }

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        const validated = await validateBody(CreateRestaurantMemberDTO, req.body);

        if (validated.branchIds && req.user) {
            const userBranchIds = await this.memberBranchCacheService.getBranchIdsByUserId(req.user.userId);
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

            sendCreated(res, member);
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

            sendSuccess(res, { message: "Member updated" });
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

            sendSuccess(res, { message: "Member branches updated" });
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

            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    }

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleName = req.params.roleName as string;
            const permissions = await this.restaurantMemberService.getRolePermissions(roleName);

            sendSuccess(res, { role: roleName, permissions });
        } catch (error) {
            next(error);
        }
    }

    getRolePermissionsInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleName = String(req.query.role ?? "");
            const permissions = await this.restaurantMemberService.getRolePermissionNames(roleName);

            sendSuccess(res, { role: roleName, permissions });
        } catch (error) {
            next(error);
        }
    }
}