import { db } from "../../../common/knex/knex";
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

export async function updateBranchDetails(branchId: number, productId: number, data: { price?: number, stock?: number, isAvailable?: boolean }): Promise<ProductBranch> {
    const [row] = await db("product_branch")
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
