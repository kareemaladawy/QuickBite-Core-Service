import { validateBody } from "../../../lib/validation/validate";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { AuthService } from "../service/auth.service";
import { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError } from "../../../lib/auth/errors";
import { setTokenCookies } from "../../../lib/auth/helpers";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendCreated, sendSuccess } from "../../../lib/http/response";

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(RegisterDTO, req.body);
            const result = await this.authService.register(validated);

            setTokenCookies(result.accessToken, result.refreshToken, res);

            return sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(LoginDTO, req.body);
            const result = await this.authService.login(validated);

            setTokenCookies(result.accessToken, result.refreshToken, res);

            return sendSuccess(res, result);
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

            return sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ForgetPasswordDTO, req.body);
            await this.authService.forgetPassword(validated);

            return sendSuccess(res, { message: "An email was sent to you if your email is registered" });
        } catch (error) {
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(validated);

            return sendSuccess(res, { message: "Your password was reset" });
        } catch (error) {
            next(error);
        }
    }

    acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.acceptInvite(validated);

            return sendSuccess(res, { message: "Your invitation was accepted" });
        } catch (error) {
            next(error);
        }
    }
}