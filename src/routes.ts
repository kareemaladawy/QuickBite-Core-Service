import { Router } from "express";
import { healthRouter } from "./app/health/routes.js";

export const routes = Router();

routes.use('/health', healthRouter);

// users
// auth
// ..