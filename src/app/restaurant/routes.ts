import { Router } from "express";
import { restaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../common/auth/middleware/guard";
import { rbac, requireRestaurantMember } from "../../common/auth/middleware/rbac";

export const restaurantRouter = Router();

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
