import AppError from "../../lib/errors/AppError";

export const UnauthorizedError = new AppError(
    "Unauthorized",
    403,
);

export const MediaNotFoundError = new AppError(
    "Media not found",
    404,
);

export const MediaOwnershipError = new AppError(
    "You do not have access to this media",
    403,
);

export const MediaNotUploadedError = new AppError(
    "Media has not been uploaded to storage yet",
    409,
);
