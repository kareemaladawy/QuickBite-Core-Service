import { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../lib/validation/validate";
import { UpdateRestaurantDto, UpdateRestaurantStatusDto } from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import { InvalidRestaurantIdError, UnauthorizedError } from "../errors";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendPaginated, sendSuccess } from "../../../lib/http/response";
import { parseFiltersFromQuery, parsePaginationFromQuery } from "../../../lib/http/pagination/parse-query";

@injectable()
export class RestaurantController {
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService) { }

    getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paginationParams = parsePaginationFromQuery(req.query, ['createdAt', 'id']);
            const filters = parseFiltersFromQuery(req.query, ['createdAt', 'id', 'name', 'status']);
            const restaurants = await this.restaurantService.getRestaurants(paginationParams, filters);

            sendPaginated(res, restaurants.data, restaurants.meta);
        } catch (error) {
            next(error);
        }
    }

    findRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.id);
            const restaurant = await this.restaurantService.findRestaurantById(restaurantId);

            sendSuccess(res, restaurant);
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

            sendSuccess(res, { message: "Restaurant status updated" });
        } catch (error) {
            next(error);
        }
    }

    updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = parseInt(req.params.id as SystemRole);
            const validated = await validateBody(UpdateRestaurantDto, req.body);

            await this.restaurantService.updateRestaurant(
                restaurantId,
                validated
            );

            sendSuccess(res, { message: "Restaurant updated" });
        } catch (error) {
            next(error);
        }
    }
}