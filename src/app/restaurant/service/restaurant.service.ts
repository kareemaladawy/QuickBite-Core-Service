import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findRestaurantById, getRestaurants, updateRestaurant, updateRestaurantStatus } from "../repository/restaurant.repo";
import { RestaurantNotFoundError } from "../errors";
import { UpdateRestaurantDto } from "../dto/restaurant.dto";
import { restaurantMemberService, RestaurantMemberService } from "../../rbac/service/restaurant-member.service";

export class RestaurantService {
    constructor(
        private readonly restaurantMemberService: RestaurantMemberService
    ) { }

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

    createWithOwner: any = async (userId: number, data: RegisterRestaurantDTO, transaction: Knex) => {
        const restaurant = await createRestaurant(new Restaurant({
            ownerId: userId,
            name: data.name,
            primaryRegion: data.primaryRegion,
            status: RestaurantStatus.PENDING,
            logoURL: data.logoURL,
        }), transaction);

        await this.restaurantMemberService.createOwnerMember(restaurant.id, userId, transaction);
    }

    updateRestaurantStatus = async (id: number, status: RestaurantStatus): Promise<void> => {
        await updateRestaurantStatus(id, status);
    }

    updateRestaurant = async (id: number, data: UpdateRestaurantDto): Promise<void> => {
        await updateRestaurant(id, data);
    }
}

export const restaurantService = new RestaurantService(restaurantMemberService);