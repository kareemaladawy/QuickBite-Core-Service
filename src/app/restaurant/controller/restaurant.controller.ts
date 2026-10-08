import { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../common/validation/validate";
import { UpdateRestaurantDto, UpdateRestaurantStatusDto } from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import { InvalidRestaurantIdError, UnauthorizedError } from "../errors";

export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurants = await this.restaurantService.getRestaurants();

            return res.status(200).json({
                data: restaurants,
            });
        } catch (error) {
            next(error);
        }
    }

    findRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.id);
            const restaurant = await this.restaurantService.findRestaurantById(restaurantId);

            return res.status(200).json({
                data: restaurant,
            });
        } catch (error) {
            next(error);
        }
    }

    updateRestaurantStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user?.role as SystemRole;

            if (userRole !== SystemRole.SYSTEM_ADMIN) {
                throw UnauthorizedError;
            }

            const restaurantId = parseInt(req.params.id as string);
            if (isNaN(restaurantId)) {
                throw InvalidRestaurantIdError;
            }
            const validated = await validateBody(UpdateRestaurantStatusDto, req.body);
            await this.restaurantService.updateRestaurantStatus(
                restaurantId,
                validated.status
            );

            return res.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId as number;
            const userRole = req.user?.role as string;
            const restaurantId = parseInt(req.params.id as SystemRole);
            const restaurant = await this.restaurantService.findRestaurantById(restaurantId);

            if (!(userRole == SystemRole.RESTAURANT_USER && userId == restaurant.ownerId
                || userRole == SystemRole.SYSTEM_ADMIN)
            ) {
                throw UnauthorizedError;
            }

            const validated = await validateBody(UpdateRestaurantDto, req.body);
            await this.restaurantService.updateRestaurant(
                restaurantId,
                validated
            );

            return res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}

export const restaurantController = new RestaurantController(new RestaurantService());