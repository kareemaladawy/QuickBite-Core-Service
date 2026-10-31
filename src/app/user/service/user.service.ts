import { Knex } from "knex";
import { UserAlreadyExistsError, UserNotFoundError } from "../errors";
import { createUser, findUserById, updateUserProfile, userExistsByEmailOrPhone } from "../repository/user.repo";
import { hashPassword } from "../../auth/utils";
import { User } from "../entity/user.entity";
import { CreateUserData } from "../types";
import { SystemRole } from "../enums";
import { injectable } from "tsyringe";

@injectable()
export class UserService {
    create = async (data: CreateUserData, transaction?: Knex): Promise<User> => {
        const userExists = await userExistsByEmailOrPhone(data.email, data.phone);

        if (userExists) {
            throw UserAlreadyExistsError;
        }

        const passwordHash = data.password == "" ? "" : await hashPassword(data.password);

        return await createUser(new User({
            email: data.email,
            phone: data.phone,
            name: data.name,
            passwordHash: passwordHash,
            systemRole: data.systemRole
        }), transaction);
    }

    getUserById: any = async (id: number) => {
        const user = await findUserById(id);

        if (!user) {
            throw UserNotFoundError;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.systemRole,
        }
    }

    getAgentById: any = async (id: number) => {
        const user = await findUserById(id);

        // Same not-found error whether the id doesn't exist or belongs to a non-agent
        // user — this is an internal lookup keyed on "is this id a delivery agent",
        // not a generic user fetch, so it shouldn't leak which case it is.
        if (!user || user.systemRole !== SystemRole.DELIVERY_AGENT) {
            throw UserNotFoundError;
        }

        return {
            // bigint columns come back from pg as strings; coerce since this feeds a
            // cross-service contract (order-service's core-client).
            id: Number(user.id),
            name: user.name,
            phone: user.phone,
        };
    }

    updateUserById: any = async (id: number, data: Object) => {
        const user = await findUserById(id);

        if (!user) {
            throw UserNotFoundError;
        }

        const updatedUser = await updateUserProfile(id, data);

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.systemRole,
        }
    }
}