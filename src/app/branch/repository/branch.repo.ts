import { Knex } from "knex";
import { Branch } from "../entity/branch.entity";
import { db } from "../../../common/knex/knex";
import { RestaurantStatus } from "../../restaurant/enums";
import { UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";

const branchColumns = [
    "id",
    "restaurant_id",
    "address_text",
    "label",
    "currency",
    "lat",
    "long",
    "opens_at",
    "closes_at",
    "is_active",
    "accepts_orders",
    "country_code",
    "delivery_radius",
    "commission_percentage",
    "created_at",
    "updated_at",
];

function toEntity(row: any): Branch {
    return new Branch({
        id: row.id,
        restaurantId: row.restaurant_id,
        addressText: row.address_text,
        label: row.label,
        currency: row.currency,
        lat: row.lat,
        long: row.long,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        isActive: row.is_active,
        acceptsOrders: row.accepts_orders,
        countryCode: row.country_code,
        deliveryRadius: row.delivery_radius,
        commissionPercentage: row.commission_percentage,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
}

export async function createBranch(data: Partial<Branch>, transaction: Knex = db): Promise<Branch> {
    const now = new Date();
    const [row] = await transaction("branches").insert({
        restaurant_id: data.restaurantId,
        address_text: data.addressText,
        label: data.label,
        currency: data.currency,
        lat: data.lat,
        long: data.long,
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        is_active: false,
        accepts_orders: data.acceptsOrders,
        country_code: data.countryCode,
        delivery_radius: data.deliveryRadius,
        commission_percentage: data.commissionPercentage,
        created_at: now,
        updated_at: now,
    }).returning(branchColumns);

    return toEntity(row);
}

export async function updateBranchStatus(branchId: number, data: UpdateBranchStatusDTO, transaction: Knex = db): Promise<void> {
    await transaction("branches")
        .where("id", branchId)
        .update({
            is_active: data.isActive,
            commission_percentage: data.commissionPercentage,
            updated_at: new Date(),
        });
}

export async function updateBranchDetails(branchId: number, data: UpdateBranchDetailsDTO, transaction: Knex = db): Promise<void> {
    await transaction("branches")
        .where("id", branchId)
        .update({
            address_text: data.addressText,
            label: data.label,
            currency: data.currency,
            opens_at: data.opensAt,
            closes_at: data.closesAt,
            accepts_orders: data.acceptsOrders,
            delivery_radius: data.deliveryRadius,
            updated_at: new Date(),
        });
}

export async function findNearbyBranches(lat: number, long: number): Promise<Branch[]> {
    const result = await db.raw(`
        SELECT b.*, r.name, r.logo_url 
        FROM branches b join restaurants r on b.restaurant_id = r.id
        WHERE b.is_active = true AND b.accepts_orders = true AND r.status = ?
        AND ST_DWithin(b.location, ST_MakePoint(?::float, ?::float), b.delivery_radius*1000)
    `, [
        RestaurantStatus.ACTIVE,
        long,
        lat
    ]);

    return result.rows.map(toEntity);
}

export async function listBranchesByRestaurantId(restaurantId: number): Promise<Branch[]> {
    const rows = await db("branches").where("restaurant_id", restaurantId).select(branchColumns);

    return rows.map(toEntity);
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
    const row = await db("branches").where("id", id).select(branchColumns).first();

    return row ? toEntity(row) : undefined;
}