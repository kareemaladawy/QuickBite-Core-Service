import AppError from "../../lib/errors/AppError";

export const CustomerAddressNotFoundError = new AppError(
    "Address not found",
    404,
    true
);
