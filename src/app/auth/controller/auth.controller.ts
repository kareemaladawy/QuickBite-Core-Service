import { validateBody } from "../../../common/validation/validate";
import { LoginDTO, RegisterDTO } from "../dto/auth.dto";
import { authService, AuthService } from "../service/auth.service";
import { NextFunction, Request, Response } from "express";

export class AuthController {
    constructor(private readonly AuthService: AuthService) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(RegisterDTO, req.body);
            const result = await this.AuthService.register(validated);

            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(LoginDTO, req.body);
            const result = await this.AuthService.login(validated);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController(authService);