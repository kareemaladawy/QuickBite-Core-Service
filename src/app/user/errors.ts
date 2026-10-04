import AppError from "../../common/errors/AppError";

export const UserAlreadyExistsError = new AppError(
    "A user with this email or phone already exists",
    409,
    true
);

export const UserNotFoundError = new AppError(
    "User not found",
    404,
    true
);

export const IncorrectLoginCredentials = new AppError(
    "Incorrect email or password",
    401,
    true
);