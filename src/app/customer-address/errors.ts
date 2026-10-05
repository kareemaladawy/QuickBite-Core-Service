import AppError from "../../common/errors/AppError";

export const CustomerAddressNotFoundError = new AppError(
    "Address not found",
    404,
    true
);
