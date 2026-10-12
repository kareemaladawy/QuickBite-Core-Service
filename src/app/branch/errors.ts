import AppError from "../../lib/errors/AppError";

export const UnauthorizedError = new AppError(
    "Unauthorized",
    403,
);

export const BranchNotFoundError = new AppError(
    "Branch not found",
    404,
);

export const BranchesDontBelongToRestaurantError = new AppError(
    "Some branches don't belong to this restaurant",
    400,
);