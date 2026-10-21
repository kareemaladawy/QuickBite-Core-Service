import AppError from "../../lib/errors/AppError";

export const ProductNotFoundError = new AppError('Product not found', 404);

export interface StockUnderflow {
    productId: number;
    requested: number;
    available: number;
}

export function insufficientStockError(offending: StockUnderflow[]): AppError {
    return new AppError('Insufficient stock for one or more items', 409, true, { items: offending });
}

export interface ReleaseStockMiss {
    productId: number;
}

export function releaseStockFailedError(offending: ReleaseStockMiss[]): AppError {
    return new AppError('One or more items could not be found to release stock for', 409, true, { items: offending });
}
