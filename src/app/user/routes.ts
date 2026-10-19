import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { requireInternalApiKey } from "../../lib/auth/middleware/api-key";
import { container } from "../../lib/di/container";
import { UserController } from "./controller/user.controller";
import { TOKENS } from "../../lib/di/tokens";

export const userRouter = Router();

// mounted at root (not under /users) so the internal path matches the
// documented cross-service contract: GET /api/internal/agents/:id
export const agentInternalRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

agentInternalRouter.get(
    '/internal/agents/:id',
    requireInternalApiKey,
    userController.findAgentInternal
);

userRouter.get('/me', authenticate, userController.getMe);
userRouter.patch('/me', authenticate, userController.updateMe);