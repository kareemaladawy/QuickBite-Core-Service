import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Product } from "../entity/product.entity";

const PRODUCT_COLUMNS = [
    'id',
    'name',
    'description',
    'image_url',
    'restaurant_id',
    'category_id',
    'created_at',
    'updated_at',
    'deleted_at'
];

function toEntity(row: any): Product {
    return new Product({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    });
}

export async function createProduct(data: Partial<Product>, transaction: Knex = db): Promise<Product> {
    const [row] = await transaction("products").insert({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        restaurant_id: data.restaurantId,
        category_id: data.categoryId,
    }).returning(PRODUCT_COLUMNS);

    return toEntity(row);
}

export async function findProductById(id: number): Promise<Product | undefined> {
    const row = await db("products")
        .select(PRODUCT_COLUMNS)
        .where("id", id)
        .whereNull("deleted_at")
        .first();

    return row ? toEntity(row) : undefined;
}

export async function findProductsByRestaurant(restaurantId: number): Promise<Product[]> {
    const rows = await db("products")
        .select(PRODUCT_COLUMNS)
        .where("restaurant_id", restaurantId)
        .whereNull("deleted_at");

    return rows.map(toEntity);
}

export async function findProductsByBranch(branchId: number) {
    const rows = await db("products as p")
        .join("product_branch as pb", "p.id", "pb.product_id")
        .leftJoin("product_categories as pc", "p.category_id", "pc.id")
        .where("pb.branch_id", branchId)
        .whereNull("p.deleted_at")
        .select(
            "p.id",
            "p.name",
            "p.description",
            "p.image_url",
            "p.restaurant_id",
            "p.category_id",
            "pc.name as category_name",
            "pb.price",
            "pb.stock",
            "pb.is_available",
        );

    return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}

export interface BranchProductDetailRow {
    productId: number;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    isAvailable: boolean;
}

export async function findProductsByBranchAndIds(branchId: number, productIds: number[]): Promise<BranchProductDetailRow[]> {
    if (productIds.length === 0) return [];

    const rows = await db("products as p")
        .join("product_branch as pb", "p.id", "pb.product_id")
        .where("pb.branch_id", branchId)
        .whereIn("p.id", productIds)
        .whereNull("p.deleted_at")
        .select(
            "p.id",
            "p.name",
            "p.image_url",
            "pb.price",
            "pb.stock",
            "pb.is_available",
        );

    return rows.map((row: any): BranchProductDetailRow => ({
        productId: row.id,
        name: row.name,
        imageUrl: row.image_url,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}

export async function updateProduct(id: number, data: Record<string, any>, transaction: Knex = db): Promise<Product> {
    const [row] = await transaction("products").where("id", id).update({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        category_id: data.categoryId,
        updated_at: new Date(),
    }).returning(PRODUCT_COLUMNS);

    return toEntity(row);
}
