import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { container } from "../../lib/di/container";
import { UserController } from "./controller/user.controller";
import { TOKENS } from "../../lib/di/tokens";

export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

userRouter.get('/me', authenticate, userController.getMe);
userRouter.patch('/me', authenticate, userController.updateMe);