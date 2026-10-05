import { Router } from "express";
import { authController } from "./controller/auth.controller";
import { authenticate } from "../../common/auth/guard";

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/forget-password', authController.forgetPassword);
authRouter.post('/reset-password', authController.resetPassword);