import { Knex } from "knex";
import { Branch } from "../entity/branch.entity";
import { db } from "../../../lib/knex/knex";
import { RestaurantStatus } from "../../restaurant/enums";
import { UpdateBranchDetailsDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { NearbyBranchRow, BranchWithRestaurantStatusRow } from "../types";

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
    "delivery_fee",
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
        deliveryFee: row.delivery_fee,
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
        delivery_fee: data.deliveryFee,
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
            delivery_fee: data.deliveryFee,
            updated_at: new Date(),
        });
}

interface NearbyBranchQueryRow {
    label: string;
    address_text: string;
    opens_at: string;
    closes_at: string;
    accepts_orders: boolean;
    country_code: Branch["countryCode"];
    currency: Branch["currency"];
    restaurant_name: string;
    restaurant_logo_url: string;
}

export async function findNearbyBranches(lat: number, long: number): Promise<NearbyBranchRow[]> {
    const result = await db.raw<{ rows: NearbyBranchQueryRow[] }>(`
        SELECT b.label, b.address_text, b.opens_at, b.closes_at, b.accepts_orders, b.country_code, b.currency,
        r.name as restaurant_name, r.logo_url as restaurant_logo_url
        FROM branches b join restaurants r on b.restaurant_id = r.id
        WHERE b.is_active = true AND b.accepts_orders = true AND r.status = ?
        AND ST_DWithin(b.location, ST_MakePoint(?::float, ?::float), b.delivery_radius*1000)
    `, [
        RestaurantStatus.ACTIVE,
        long,
        lat
    ]);

    return result.rows.map((row): NearbyBranchRow => {
        return {
            lable: row.label,
            restaurantName: row.restaurant_name,
            restaurantLogoUrl: row.restaurant_logo_url,
            addressText: row.address_text,
            opensAt: row.opens_at,
            closesAt: row.closes_at,
            acceptsOrders: row.accepts_orders,
            countryCode: row.country_code,
            currency: row.currency,
        };
    });
}

export async function listBranchesByRestaurantId(restaurantId: number): Promise<Branch[]> {
    const rows = await db("branches").where("restaurant_id", restaurantId).select(branchColumns);

    return rows.map(toEntity);
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
    const row = await db("branches").where("id", id).select(branchColumns).first();

    return row ? toEntity(row) : undefined;
}

export async function findBranchWithRestaurantStatusById(id: number): Promise<BranchWithRestaurantStatusRow | undefined> {
    return db("branches as b")
        .join("restaurants as r", "r.id", "b.restaurant_id")
        .where("b.id", id)
        .select(
            "b.id",
            "b.restaurant_id",
            "r.status as restaurant_status",
            "b.accepts_orders",
            "b.is_active",
            "b.delivery_fee",
            "b.commission_percentage",
            "b.currency",
            "b.lat",
            "b.long",
            "b.label",
            "b.address_text",
            "b.country_code",
        )
        .first();
}

export async function branchExistsById(id: number): Promise<boolean> {
    const result = await db.raw(`select exists (select 1 from branches where id = ?) as "exists"`, [
        id,
    ]);

    return result.rows[0].exists;
}