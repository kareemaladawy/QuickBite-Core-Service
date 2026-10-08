import { Restaurant } from "../entity/restaurant.entity";
import { db } from "../../../common/knex/knex";
import { Knex } from "knex";
import { UpdateRestaurantDto } from "../dto/restaurant.dto";

const restaurantColumns = [
    "id",
    "owner_id",
    "name",
    "primary_region",
    "logo_url",
    "status",
    "status_updated_at",
    "created_at",
    "updated_at",
];

const restaurantsListColumns = [
    "id",
    "name",
    "primary_region",
    "logo_url",
    "status",
    "created_at",
];

function toEntity(row: any): Restaurant {
    return new Restaurant({
        id: row.id,
        name: row.name,
        ownerId: row.owner_id,
        primaryRegion: row.primary_region,
        status: row.status,
        logoURL: row.logo_url,
        statusUpdatedAt: row.status_updated_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function getRestaurants(): Promise<Restaurant[]> {
    const rows = await db("restaurants").select(restaurantsListColumns);

    return rows.map(toEntity);
}

export async function findRestaurantById(id: number): Promise<Restaurant | undefined> {
    const row = await db("restaurants").select(restaurantColumns).where("id", id).first();

    return row ? toEntity(row) : undefined;
}

export async function createRestaurant(data: Partial<Restaurant>, transaction: Knex = db): Promise<Restaurant> {
    const now = new Date();
    const [row] = await transaction("restaurants").insert({
        owner_id: data.ownerId,
        name: data.name,
        primary_region: data.primaryRegion,
        logo_url: data.logoURL,
        status: data.status,
        created_at: now,
        updated_at: now,
    }).returning(restaurantColumns);

    return toEntity(row);
}

export async function updateRestaurantStatus(id: number, status: string, transaction: Knex = db): Promise<void> {
    const now = new Date();
    await transaction("restaurants")
        .where("id", id)
        .update({
            status: status,
            status_updated_at: now,
            updated_at: now,
        });
}


export async function updateRestaurant(id: number, data: UpdateRestaurantDto, transaction: Knex = db): Promise<void> {
    await transaction("restaurants")
        .where("id", id)
        .update({
            name: data.name,
            primary_region: data.primaryRegion,
            logo_url: data.logoURL,
            updated_at: new Date()
        });
}

