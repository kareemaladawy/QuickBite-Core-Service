export interface ReserveStockItemInput {
    productId: number;
    quantity: number;
}

export interface ReserveStockFailure {
    productId: number;
    requested: number;
    available: number;
}

export interface ReleaseStockFailure {
    productId: number;
}

export interface StockUnderflow {
    productId: number;
    requested: number;
    available: number;
}

export interface ReleaseStockMiss {
    productId: number;
}

// Shape returned by product.repository.ts#findProductsByBranchAndIds — a join projection, not a Product entity.
export interface BranchProductDetailRow {
    productId: number;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    isAvailable: boolean;
}

// New stock/availability for an item after a reserveStock()/releaseStock() write —
// carried back so callers can publish a PRODUCT_STOCK_CHANGED event without a second
// read of the row they just wrote.
export interface StockUpdateResult {
    productId: number;
    stock: number;
    isAvailable: boolean;
}
