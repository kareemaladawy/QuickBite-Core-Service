import AppError from "../errors/AppError";

export const NotAuthenticatedError = new AppError("Unauthenticated", 401, true);

export const PermissionDeniedError = new AppError("Permission denied", 403, true);