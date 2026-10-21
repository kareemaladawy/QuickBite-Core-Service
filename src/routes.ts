import { Router } from "express";
import { healthRouter } from "./app/health/routes.js";
import { authRouter } from "./app/auth/routes.js";
import { userRouter, agentInternalRouter } from "./app/user/routes.js";
import { customerAddressRouter, customerAddressInternalRouter } from "./app/customer-address/routes.js";
import { restaurantRouter } from "./app/restaurant/routes.js";
import { branchRouter } from "./app/branch/routes.js";
import { productRouter } from "./app/product/routes.js";
import { restaurantMemberRouter } from "./app/rbac/routes.js";

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
routes.use('/users', userRouter);
routes.use('/restaurants', restaurantRouter);
routes.use('/', customerAddressRouter);
routes.use('/', productRouter);
routes.use('/', branchRouter);
routes.use('/', restaurantMemberRouter);
routes.use('/', customerAddressInternalRouter);
routes.use('/', agentInternalRouter);
