import { Router } from "express";
import { healthRouter } from "./app/health/routes.js";
import { authRouter } from "./app/auth/routes.js";

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
