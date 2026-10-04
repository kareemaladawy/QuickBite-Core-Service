import AppError from "../../common/errors/AppError";

export const SystemAdminCannotRegisterError = new AppError(
    "You cannot register as a system admin",
    403,
    false
);