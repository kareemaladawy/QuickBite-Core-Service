import { NextFunction, Request, Response } from "express";
import { UserService } from "../service/user.service";
import { validateBody } from "../../../lib/validation/validate";
import { UpdateProfileDTO } from "../dto/user.dto";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class UserController {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService) { };

    getMe: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.getUserById(req.user?.userId)

            return res.status(200).json({ user: user });
        } catch (error) {
            next(error);
        }
    }

    updateMe: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(UpdateProfileDTO, req.body);
            const user = await this.userService.updateUserById(req.user?.userId, validated)

            return res.status(200).json({ user: user });
        } catch (error) {
            next(error);
        }
    }
}