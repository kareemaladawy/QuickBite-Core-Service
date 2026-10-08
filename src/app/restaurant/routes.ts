import { Router } from "express";
import { restaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../common/auth/guard";

export const restaurantRouter = Router();

restaurantRouter.get('/', restaurantController.getRestaurants);
restaurantRouter.get('/:id', restaurantController.findRestaurantById);
restaurantRouter.patch('/:id/status', authenticate, restaurantController.updateRestaurantStatus);
restaurantRouter.patch('/:id', authenticate, restaurantController.updateRestaurant);
