import AppError from "../../common/errors/AppError";

export const UnauthorizedError = new AppError(
    "Unauthorized",
    403,
    true
);

export const BranchNotFoundError = new AppError(
    "Branch not found",
    404,
    true
);