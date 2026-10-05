import { UserNotFoundError } from "../errors";
import { findUserById, updateUserProfile } from "../repository/user.repo";

export class UserService {
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

    updateUserById: any = async (id: number, data: Object) => {
        const user = await findUserById(id);

        if (!user) {
            throw UserNotFoundError;
        }

        await updateUserProfile(id, data);

        const updatedUser = await findUserById(id);

        return {
            id: updatedUser!.id,
            name: updatedUser!.name,
            email: updatedUser!.email,
            phone: updatedUser!.phone,
            role: updatedUser!.systemRole,
        }
    }
}

// singleton pattern: only one instance of UserService accorss the application to optimize memory
export const userService = new UserService();