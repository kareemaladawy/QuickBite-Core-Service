import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductBranch } from "../entity/product-branch.entity";
import { ReserveStockItemInput, ReserveStockFailure, ReleaseStockFailure, StockUpdateResult } from "../types";

const PB_COLUMNS = [
    'id',
    'branch_id',
    'product_id',
    'price',
    'stock',
    'is_available'
];

function toEntity(row: any): ProductBranch {
    return new ProductBranch({
        id: row.id,
        branchId: row.branch_id,
        productId: row.product_id,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    });
}

// Decrements each item's stock in one trx, only where stock >= requested (underflow guard).
// Returns the items that couldn't be reserved; caller rolls back the trx if this is non-empty.
export async function reserveStock(branchId: number, items: ReserveStockItemInput[], transaction: Knex): Promise<{ failures: ReserveStockFailure[], updated: StockUpdateResult[] }> {
    if (items.length === 0) {
        return { failures: [], updated: [] };
    }

    const caseClauses = items.map(() => "WHEN product_id = ? THEN stock - ?").join(" ");
    const caseBindings = items.flatMap((item) => [item.productId, item.quantity]);

    // Per-item underflow guard: a row only matches (and gets decremented) when its own
    // requested quantity fits its current stock, so items with insufficient stock are
    // simply excluded from the update rather than updated incorrectly.
    const guardClauses = items.map(() => "(product_id = ? AND stock >= ?)").join(" OR ");
    const guardBindings = items.flatMap((item) => [item.productId, item.quantity]);

    const rows = await transaction("product_branch")
        .where("branch_id", branchId)
        .whereIn("product_id", items.map((item) => item.productId))
        .andWhere(transaction.raw(`(${guardClauses})`, guardBindings))
        .update({ stock: transaction.raw(`CASE ${caseClauses} ELSE stock END`, caseBindings) })
        .returning(["product_id", "stock", "is_available"]);

    // product_id is a bigint column — pg returns it as a string, while items carry it as
    // a number, so every lookup below normalizes with Number() to keep them comparable.
    const updated: StockUpdateResult[] = rows.map((row) => ({ productId: Number(row.product_id), stock: row.stock, isAvailable: row.is_available }));

    const updatedProductIds = new Set(updated.map((u) => u.productId));
    const failedItems = items.filter((item) => !updatedProductIds.has(item.productId));

    let failures: ReserveStockFailure[] = [];
    if (failedItems.length > 0) {
        const currentRows = await transaction("product_branch")
            .where("branch_id", branchId)
            .whereIn("product_id", failedItems.map((item) => item.productId))
            .select("product_id", "stock");

        const currentStockByProductId = new Map(currentRows.map((row) => [Number(row.product_id), row.stock]));

        failures = failedItems.map((item) => ({
            productId: item.productId,
            requested: item.quantity,
            available: currentStockByProductId.get(item.productId) ?? 0,
        }));
    }

    return { failures, updated };
}

// Increments each item's stock back in one trx — undoes a prior reserveStock() call
// (e.g. order-service releasing a reservation when it fails to persist the order). No
// underflow guard needed since this only adds stock back. Returns items whose
// product_branch row wasn't found, which shouldn't happen for a release referencing an
// earlier successful reservation; caller rolls back the trx if this is non-empty.
export async function releaseStock(branchId: number, items: ReserveStockItemInput[], transaction: Knex): Promise<{ failures: ReleaseStockFailure[], updated: StockUpdateResult[] }> {
    if (items.length === 0) {
        return { failures: [], updated: [] };
    }

    const caseClauses = items.map(() => "WHEN product_id = ? THEN stock + ?").join(" ");
    const caseBindings = items.flatMap((item) => [item.productId, item.quantity]);

    const rows = await transaction("product_branch")
        .where("branch_id", branchId)
        .whereIn("product_id", items.map((item) => item.productId))
        .update({ stock: transaction.raw(`CASE ${caseClauses} ELSE stock END`, caseBindings) })
        .returning(["product_id", "stock", "is_available"]);

    // product_id is a bigint column — pg returns it as a string, while items carry it as
    // a number, so updated.productId is normalized with Number() to keep them comparable.
    const updated: StockUpdateResult[] = rows.map((row) => ({ productId: Number(row.product_id), stock: row.stock, isAvailable: row.is_available }));

    const updatedProductIds = new Set(updated.map((u) => u.productId));
    const failures: ReleaseStockFailure[] = items
        .filter((item) => !updatedProductIds.has(item.productId))
        .map((item) => ({ productId: item.productId }));

    return { failures, updated };
}

export async function updateBranchDetails(branchId: number, productId: number, data: { price?: number, stock?: number, isAvailable?: boolean }, transaction: Knex = db): Promise<ProductBranch> {
    const [row] = await transaction("product_branch")
        .where("branch_id", branchId)
        .where("product_id", productId)
        .update({
            price: data.price,
            stock: data.stock,
            is_available: data.isAvailable,
        })
        .returning(PB_COLUMNS);

    return toEntity(row);
}
