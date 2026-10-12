import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/middleware/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { RestaurantController } from "./controller/restaurant.controller";

export const restaurantRouter = Router();

const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);

restaurantRouter.get('/', restaurantController.getRestaurants);
restaurantRouter.get('/:id', restaurantController.findRestaurantById);

restaurantRouter.patch(
    '/:id/status',
    authenticate,
    restaurantController.updateRestaurantStatus
);

restaurantRouter.patch(
    '/:id',
    authenticate,
    requireRestaurantMember('id'),
    rbac({ resource: 'core:restaurant', action: 'update' }),
    restaurantController.updateRestaurant
);
