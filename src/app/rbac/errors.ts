import AppError from "../../common/errors/AppError";

export const CannotCreateOwnerError = new AppError("Cannot create an owner", 400);
export const RoleNotFoundError = new AppError("Role not found", 404);
export const MemberNotFoundError = new AppError('Member not found', 404);
export const CannotDeleteOwnerError = new AppError('Cannot delete the restaurant owner', 400);

export const InternalServerError = new AppError(
    "Something went wrong",
    500,
    false
);
