import AppError from "../../lib/errors/AppError";

export const ProductNotFoundError = new AppError('Product not found', 404);
