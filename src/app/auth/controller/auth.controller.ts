import { env } from "node:process";
import { validateBody } from "../../../lib/validation/validate";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { authService, AuthService } from "../service/auth.service";
import { NextFunction, Request, Response } from "express";
import { days, hours } from "../../../pkg/utils/time";
import { NotAuthenticatedError } from "../../../lib/auth/errors";

function setTokenCookies(accessToken: string, refreshToken: string, res: Response) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: hours(1)
    })

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: days(7),
        path: "/api/v1/auth/refresh"
    })
}

export class AuthController {
    constructor(private readonly authService: AuthService) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(RegisterDTO, req.body);
            const result = await this.authService.register(validated);

            setTokenCookies(result.accessToken, result.refreshToken, res);

            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(LoginDTO, req.body);
            const result = await this.authService.login(validated);

            setTokenCookies(result.accessToken, result.refreshToken, res);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refresh_token;

            if (!refreshToken) {
                throw NotAuthenticatedError;
            }

            const result = await this.authService.refreshToken(refreshToken);

            setTokenCookies(result.accessToken, result.refreshToken, res);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ForgetPasswordDTO, req.body);
            await this.authService.forgetPassword(validated);

            return res.status(200).json({ message: "An email was sent to you if your email is registered" });
        } catch (error) {
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(validated);

            return res.status(200).json({ message: "Your password was reset" });
        } catch (error) {
            next(error);
        }
    }

    acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.acceptInvite(validated);

            return res.status(200).json({ message: "Your invitation was accepted" });
        } catch (error) {
            next(error);
        }
    }
}

// singleton pattern: only one instance of UserService accorss the application to optimize memory
export const authController = new AuthController(authService);