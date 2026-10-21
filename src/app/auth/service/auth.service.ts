import { User } from "../../user/entity/user.entity";
import { SystemRole } from "../../user/enums";
import { findUserByEmail, findUserById, updateUserPassword } from "../../user/repository/user.repo";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { PasswordReset } from "../entity/password-reset.entity";
import { IncorrectLoginCredentials, IncorrectOTP, NoMemberProfileFound, PasswordResetAttemptExpired, RestaurantDataRequiredError, SystemAdminCannotRegisterError } from "../errors";
import { createPasswordReset, findLatestPasswordResetAttemptByUserId, setPasswordResetConsumedAt } from "../repository/password-reset.repo";
import { comparePasswordHash, generateAccessToken, generateOTP, generateRefreshToken, hashOTP, verifyRefreshToken } from "../utils";
import { toMs } from "../../../pkg/utils/time";
import { NotAuthenticatedError } from "../../../lib/auth/errors";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { db } from "../../../lib/knex/knex";
import { Restaurant } from "../../restaurant/entity/restaurant.entity";
import { activateRestaurantMember, findRestaurantMemberWithRoleName } from "../../rbac/repository/restaurant-member.repo";
import { UserService } from "../../user/service/user.service";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { PasswordResetEmail } from "../templates/password-reset.template";
import { IEmailProvider } from "../../../pkg/email/email.interface";

@injectable()
export class AuthService {
    constructor(
        @inject(TOKENS.UserService) private readonly userService: UserService,
        @inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService,
        @inject(TOKENS.EmailProvider) private readonly emailProvider: IEmailProvider
    ) { }

    generateRestaurantMemberInfoPayload: any = async (user: User) => {
        const memberData = await findRestaurantMemberWithRoleName(Number(user.id));

        if (!memberData.member) {
            throw NoMemberProfileFound;
        }

        if (memberData) {
            return {
                restaurantId: memberData.member.restaurantId,
                restaurantRole: memberData.roleName,
            }
        }

        return {};
    }

    register: any = async (data: RegisterDTO) => {
        if (data.role === SystemRole.SYSTEM_ADMIN) {
            throw SystemAdminCannotRegisterError;
        }

        let user;
        let restaurant: Partial<Restaurant> | undefined;
        let restaurantMemberInfo;
        const transaction = await db.transaction();

        try {
            user = await this.userService.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                systemRole: data.role
            }, transaction);

            if (data.role === SystemRole.RESTAURANT_USER) {
                if (data.restaurant == undefined) {
                    throw RestaurantDataRequiredError;
                }

                restaurant = await this.restaurantService.createWithOwner(
                    user.id,
                    data.restaurant,
                    transaction
                );
            }

            await transaction.commit();

            if (data.role === SystemRole.RESTAURANT_USER) {
                await this.restaurantService.invalidateRestaurantsListCache();
                restaurantMemberInfo = await this.generateRestaurantMemberInfoPayload(user);
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.systemRole,
            },
            restaurant: restaurant
        };
    }

    login: any = async (data: LoginDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) {
            throw IncorrectLoginCredentials;
        }

        const passwordMatch = await comparePasswordHash(data.password, user.passwordHash);

        if (!passwordMatch) {
            throw IncorrectLoginCredentials;
        }

        let restaurantMemberInfo;

        if (user.systemRole === SystemRole.RESTAURANT_USER) {
            restaurantMemberInfo = await this.generateRestaurantMemberInfoPayload(user);
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.systemRole,
            }
        };
    }

    refreshToken: any = async (refreshToken: string) => {
        let userId: number;

        try {
            userId = verifyRefreshToken(refreshToken).userId;
        } catch {
            throw NotAuthenticatedError;
        }

        const user = await findUserById(userId);

        if (!user) {
            throw NotAuthenticatedError;
        }

        let restaurantMemberInfo;

        if (user.systemRole === SystemRole.RESTAURANT_USER) {
            restaurantMemberInfo = await this.generateRestaurantMemberInfoPayload(user);
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        };

        return {
            accessToken: generateAccessToken(payload),
            refreshToken: generateRefreshToken(payload)
        };
    }

    forgetPassword: any = async (data: ForgetPasswordDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) {
            return;
        }

        const otp = await generateOTP();
        const otpHash = await hashOTP(otp);

        await createPasswordReset(new PasswordReset({
            userId: user.id,
            otpHash: otpHash,
            expiresAt: new Date(Date.now() + toMs(5, 'm')),
        }));

        const email = PasswordResetEmail(otp, user.name);
        await this.emailProvider.sendEmail(user.email, email.subject, email.html);
    }

    resetPassword: any = async (data: ResetPasswordDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) {
            return;
        }

        const passwordResetAttempt = await findLatestPasswordResetAttemptByUserId(user.id);

        if (!passwordResetAttempt || passwordResetAttempt.isExpired()) {
            throw PasswordResetAttemptExpired;
        }

        const otpHash = await hashOTP(data.otp);

        if (otpHash != passwordResetAttempt.otpHash) {
            throw IncorrectOTP;
        }

        updateUserPassword(user.id, data.password);
        setPasswordResetConsumedAt(passwordResetAttempt.id);

        return user;
    }

    acceptInvite = async (data: ResetPasswordDTO) => {
        const user = await this.resetPassword(data);

        await activateRestaurantMember(user.id);
    }
}