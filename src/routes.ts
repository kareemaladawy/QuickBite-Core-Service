import { Router } from "express";
import { healthRouter } from "./app/health/routes.js";
import { authRouter } from "./app/auth/routes.js";
import { userRouter } from "./app/user/routes.js";
import { customerAddressRouter } from "./app/customer-address/routes.js";
import { restaurantRouter } from "./app/restaurant/routes.js";
import { branchRouter } from "./app/branch/routes.js";
import { productRouter } from "./app/product/routes.js";

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
routes.use('/users', userRouter);
routes.use('/customer-addresses', customerAddressRouter);
routes.use('/restaurants', restaurantRouter);
routes.use('/', productRouter);
routes.use('/', branchRouter);
