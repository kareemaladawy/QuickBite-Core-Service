import AppError from "../errors/AppError";

export const NotAuthenticatedError = new AppError("You are not authenticated", 401, true);

export const UnAuthorisedError = new AppError("You are not authorized", 403, true);