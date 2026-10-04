import { User } from "../../user/entity/user.entity";
import { SystemRole } from "../../user/enums";
import { UserAlreadyExistsError } from "../../user/errors";
import { createUser, userExistsByEmailOrPhone } from "../../user/repository/user.repo";
import { RegisterDTO } from "../dto/auth.dto";
import { SystemAdminCannotRegisterError } from "../errors";
import { generateAccessToken, generateRefreshToken, hashPassword } from "../utils";

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
}

export const authService = new AuthService();