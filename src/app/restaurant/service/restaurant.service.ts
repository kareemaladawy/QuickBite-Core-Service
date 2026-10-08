import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findRestaurantById, getRestaurants, updateRestaurant, updateRestaurantStatus } from "../repository/restaurant.repo";
import { RestaurantNotFoundError } from "../errors";
import { UpdateRestaurantDto } from "../dto/restaurant.dto";

export class RestaurantService {
    getRestaurants: any = async () => {
        const restaurants = await getRestaurants();

        return restaurants;
    }

    findRestaurantById = async (id: number) => {
        const restaurant = await findRestaurantById(id);

        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        return restaurant;
    }

    createRestaurant: any = async (userId: number, data: RegisterRestaurantDTO, transaction: Knex) => {
        const restaurant = await createRestaurant(new Restaurant({
            ownerId: userId,
            name: data.name,
            primaryRegion: data.primaryRegion,
            status: RestaurantStatus.PENDING,
            logoURL: data.logoURL,
        }), transaction);

        return restaurant;
    }

    updateRestaurantStatus = async (id: number, status: RestaurantStatus) => {
        await updateRestaurantStatus(id, status);
    }

    updateRestaurant = async (id: number, data: UpdateRestaurantDto) => {
        await updateRestaurant(id, data);
    }
}

export const restaurantService = new RestaurantService();