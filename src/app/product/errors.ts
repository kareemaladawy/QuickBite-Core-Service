import AppError from "../../common/errors/AppError";

export const ProductNotFoundError = new AppError('Product not found', 404);
