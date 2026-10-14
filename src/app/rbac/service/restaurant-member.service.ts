import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { toMs } from "../../../pkg/utils/time";
import { PasswordReset } from "../../auth/entity/password-reset.entity";
import { createPasswordReset } from "../../auth/repository/password-reset.repo";
import { generateOTP, hashOTP } from "../../auth/utils";
import { BranchesDontBelongToRestaurantError } from "../../branch/errors";
import { SystemRole } from "../../user/enums";
import { UserAlreadyExistsError } from "../../user/errors";
import { userExistsByEmailOrPhone } from "../../user/repository/user.repo";
import { CreateRestaurantMemberDTO, UpdateRestaurantMemberDTO } from "../dto/restaurant-member.dto";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { MemberRole, MemberStatus } from "../enums";
import { CannotCreateOwnerError, MemberNotFoundError, RoleNotFoundError } from "../errors";
import { countBranchesByIdsAndRestaurant, setMemberBranches } from "../repository/member-branch.repo";
import { getRolePermissions } from "../repository/permission.repo";
import { createRestaurantMember, deleteRestaurantMember, findMembersByRestaurantId, findRestaurantMemberById, updateRestaurantMember } from "../repository/restaurant-member.repo";
import { findRoleIdByName } from "../repository/role.repo";
import { NoSuitableRoleFound } from "../../auth/errors";
import { UserService } from "../../user/service/user.service";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { MemberBranchCacheService } from "./member-branch-cache.service";
import { MemberInvitationEmail } from "../templates/member-invitation.template";
import { MailjetEmailProvider } from "../../../pkg/utils/email/mailjet";

@injectable()
export class RestaurantMemberService {
    constructor(
        @inject(TOKENS.UserService) private readonly userService: UserService,
        @inject(TOKENS.EmailProvider) private readonly emailProvider: MailjetEmailProvider,
        @inject(TOKENS.MemberBranchCacheService) private readonly memberBranchCacheService: MemberBranchCacheService,
    ) { }

    listMembers = async (restaurantId: number) => {
        const members = await findMembersByRestaurantId(restaurantId);

        return members;
    }

    createOwnerMember = async (restaurantId: number, userId: number, transaction: Knex = db) => {
        const roleId = await findRoleIdByName(MemberRole.OWNER);

        if (!roleId) {
            throw NoSuitableRoleFound;
        }

        await createRestaurantMember({
            userId: userId,
            restaurantId: restaurantId,
            roleId: roleId,
            status: MemberStatus.ACTIVE
        }, transaction);
    }

    createMember = async (restaurantId: number, data: CreateRestaurantMemberDTO) => {
        if (data.role === MemberRole.OWNER) {
            throw CannotCreateOwnerError;
        }

        const branchCount = await countBranchesByIdsAndRestaurant(data.branchIds ?? [], restaurantId);

        if (branchCount !== data.branchIds?.length) {
            throw BranchesDontBelongToRestaurantError;
        }

        const userExists = await userExistsByEmailOrPhone(data.email, data.phone);

        if (userExists) {
            throw UserAlreadyExistsError;
        }

        const roleId = await findRoleIdByName(data.role);

        if (!roleId) {
            throw RoleNotFoundError;
        }

        const transaction = await db.transaction();

        try {
            // create user, member, and assign branches
            const user = await this.userService.create({
                email: data.email,
                phone: data.phone,
                name: data.name,
                password: "",
                systemRole: SystemRole.RESTAURANT_USER
            }, transaction);

            const member = await createRestaurantMember(new RestaurantMember({
                userId: user.id!,
                restaurantId: restaurantId,
                roleId: roleId,
                status: MemberStatus.INACTIVE
            }), transaction);

            await setMemberBranches(member.id!, data.branchIds ?? [], transaction);
            this.memberBranchCacheService.invalidate(user.id!);

            const otp = await generateOTP();
            const otpHash = await hashOTP(otp);

            await createPasswordReset(new PasswordReset({
                userId: user.id,
                otpHash: otpHash,
                expiresAt: new Date(Date.now() + toMs(15, 'm'))
            }), transaction);

            const email = MemberInvitationEmail(otp, data.name);
            await this.emailProvider.sendEmail(user.email, email.subject, email.html);

            await transaction.commit();

            return member;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    updateMember = async (restaurantId: number, memberId: number, data: UpdateRestaurantMemberDTO) => {
        const member = await findRestaurantMemberById(memberId);

        if (!member || member.restaurantId !== restaurantId) {
            throw MemberNotFoundError;
        }

        let roleId;

        if (data.role) {
            roleId = await findRoleIdByName(data.role);

            if (!roleId) {
                throw RoleNotFoundError;
            }
        }

        await updateRestaurantMember(memberId, { ...data, roleId });
    }

    deleteMember = async (restaurantId: number, memberId: number) => {
        const member = await findRestaurantMemberById(memberId);

        if (!member || member.restaurantId !== restaurantId) {
            throw MemberNotFoundError;
        }

        await deleteRestaurantMember(memberId);
        this.memberBranchCacheService.invalidate(member.userId!);
    }

    setMemberBranches = async (restaurantId: number, memberId: number, branchIds: number[]) => {
        const member = await findRestaurantMemberById(memberId);

        if (!member || member.restaurantId !== restaurantId) {
            throw MemberNotFoundError;
        }

        const branchCount = await countBranchesByIdsAndRestaurant(branchIds, restaurantId);

        if (branchCount !== branchIds.length) {
            throw BranchesDontBelongToRestaurantError;
        }

        const transaction = await db.transaction();

        try {
            await setMemberBranches(memberId, branchIds, transaction);

            await transaction.commit();
            this.memberBranchCacheService.invalidate(member.userId!);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    getRolePermissions = async (roleName: string) => {
        try {
            return await getRolePermissions(roleName);
        } catch (error) {
            throw error;
        }
    }
}