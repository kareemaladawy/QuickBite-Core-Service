import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductBranch } from "../entity/product-branch.entity";

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

export interface ReserveStockItemInput {
    productId: number;
    quantity: number;
}

export interface ReserveStockFailure {
    productId: number;
    requested: number;
    available: number;
}

// Decrements each item's stock in one trx, only where stock >= requested (underflow guard).
// Returns the items that couldn't be reserved; caller rolls back the trx if this is non-empty.
export async function reserveStock(branchId: number, items: ReserveStockItemInput[], transaction: Knex): Promise<ReserveStockFailure[]> {
    const failures: ReserveStockFailure[] = [];

    for (const item of items) {
        const [row] = await transaction("product_branch")
            .where("branch_id", branchId)
            .where("product_id", item.productId)
            .where("stock", ">=", item.quantity)
            .update({ stock: transaction.raw("stock - ?", [item.quantity]) })
            .returning(["product_id", "stock"]);

        if (!row) {
            const current = await transaction("product_branch")
                .where("branch_id", branchId)
                .where("product_id", item.productId)
                .select("stock")
                .first();

            failures.push({
                productId: item.productId,
                requested: item.quantity,
                available: current?.stock ?? 0,
            });
        }
    }

    return failures;
}

export interface ReleaseStockFailure {
    productId: number;
}

// Increments each item's stock back in one trx — undoes a prior reserveStock() call
// (e.g. order-service releasing a reservation when it fails to persist the order). No
// underflow guard needed since this only adds stock back. Returns items whose
// product_branch row wasn't found, which shouldn't happen for a release referencing an
// earlier successful reservation; caller rolls back the trx if this is non-empty.
export async function releaseStock(branchId: number, items: ReserveStockItemInput[], transaction: Knex): Promise<ReleaseStockFailure[]> {
    const failures: ReleaseStockFailure[] = [];

    for (const item of items) {
        const [row] = await transaction("product_branch")
            .where("branch_id", branchId)
            .where("product_id", item.productId)
            .update({ stock: transaction.raw("stock + ?", [item.quantity]) })
            .returning(["product_id", "stock"]);

        if (!row) {
            failures.push({ productId: item.productId });
        }
    }

    return failures;
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
