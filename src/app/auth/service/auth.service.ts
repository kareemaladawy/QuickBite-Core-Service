import { validateBody } from "../../../common/validation/validate";
import { User } from "../../user/entity/user.entity";
import { SystemRole } from "../../user/enums";
import { UserAlreadyExistsError, UserNotFoundError } from "../../user/errors";
import { createUser, findUserByEmail, findUserById, updateUserPassword, userExistsByEmail, userExistsByEmailOrPhone } from "../../user/repository/user.repo";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { PasswordReset } from "../entity/password-reset.entity";
import { IncorrectLoginCredentials, IncorrectOTP, PasswordResetAttemptExpired, SystemAdminCannotRegisterError } from "../errors";
import { createPasswordReset, findLatestPasswordResetAttemptByUserId, setPasswordResetConsumedAt } from "../repository/password-reset.repo";
import { comparePasswordHash, generateAccessToken, generateOTP, generateRefreshToken, hashOTP, hashPassword, verifyRefreshToken } from "../utils";
import { minutes } from "../../../common/utils/time";
import { NotAuthenticatedError } from "../../../common/auth/errors";

export class AuthService {
    register: any = async (data: RegisterDTO) => {
        if (data.role === SystemRole.SYSTEM_ADMIN) {
            throw SystemAdminCannotRegisterError;
        }

        const userExists = await userExistsByEmailOrPhone(data.email, data.phone);

        if (userExists) {
            throw UserAlreadyExistsError;
        }

        const passwordHash = await hashPassword(data.password);

        const user: User = await createUser(new User({
            email: data.email,
            phone: data.phone,
            name: data.name,
            passwordHash: passwordHash,
            systemRole: data.role
        }));

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole
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

    login: any = async (data: LoginDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) {
            throw IncorrectLoginCredentials;
        }

        const passwordMatch = await comparePasswordHash(data.password, user.passwordHash);

        if (!passwordMatch) {
            throw IncorrectLoginCredentials;
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole
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

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole
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
            expiresAt: new Date(Date.now() + minutes(5)),
        }));

        console.log(`Mocked email sent ${otp}`);
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
    }
}

// singleton pattern: only one instance of UserService accorss the application to optimize memory
export const authService = new AuthService();