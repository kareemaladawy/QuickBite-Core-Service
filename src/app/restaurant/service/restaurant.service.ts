import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findRestaurantById, getRestaurants, updateRestaurant, updateRestaurantStatus } from "../repository/restaurant.repo";
import { RestaurantNotFoundError } from "../errors";
import { UpdateRestaurantDto } from "../dto/restaurant.dto";
import { RestaurantMemberService } from "../../rbac/service/restaurant-member.service";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { buildPaginationResult, FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
import { db } from "../../../lib/knex/knex";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { CoreEventType } from "../../../lib/events/event-types";
import { ICacheProvider } from "../../../pkg/cache/cache.interface";

// mirrors the key withCache() derives for GET /api/v1/restaurants (no query params, so it's a single fixed key)
const RESTAURANTS_LIST_CACHE_KEYS = ["GET:/api/v1/restaurants", "GET:/api/v1/restaurants/"];

@injectable()
export class RestaurantService {
    constructor(
        @inject(TOKENS.RestaurantMemberService) private readonly restaurantMemberService: RestaurantMemberService,
        @inject(TOKENS.CacheProvider) private readonly cacheProvider: ICacheProvider
    ) { }

    invalidateRestaurantsListCache = async (): Promise<void> => {
        await Promise.all(RESTAURANTS_LIST_CACHE_KEYS.map((key) => this.cacheProvider.del(key)));
    }

    getRestaurants: any = async (paginationParams: PaginationParams, filters: FilterParams[]) => {
        const restaurants = await getRestaurants(paginationParams, filters);

        return buildPaginationResult(restaurants, paginationParams.limit, paginationParams.sortBy);
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
        const restaurant = await findRestaurantById(id);

        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        const transaction = await db.transaction();

        try {
            await updateRestaurantStatus(id, status, transaction);

            if (status === RestaurantStatus.SUSPENDED) {
                await insertOutboxEvent(transaction, {
                    aggregateType: "restaurant",
                    aggregateId: id,
                    eventType: CoreEventType.RESTAURANT_SUSPENDED,
                    payload: { restaurantId: id },
                });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        await this.invalidateRestaurantsListCache();
    }

    updateRestaurant = async (id: number, data: UpdateRestaurantDto): Promise<void> => {
        const restaurant = await findRestaurantById(id);

        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        const transaction = await db.transaction();

        try {
            await updateRestaurant(id, data, transaction);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        await this.invalidateRestaurantsListCache();
    }
}