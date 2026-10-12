import AppError from "../../lib/errors/AppError";

export const RestaurantNotFoundError = new AppError(
    "Restaurant not found",
    404,
    true
);

export const UnauthorizedError = new AppError(
    "Unauthorized",
    403,
    true
);

export const InvalidRestaurantIdError = new AppError(
    "Invalid restaurant id",
    400,
    true
);
