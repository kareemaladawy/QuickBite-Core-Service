import AppError from "../../common/errors/AppError";

export const SystemAdminCannotRegisterError = new AppError(
    "You cannot register as a system admin",
    403,
    true
);

export const IncorrectLoginCredentials = new AppError(
    "Incorrect email or password",
    401,
    true
);

export const NoMemberProfileFound = new AppError(
    "No member profile found for your account",
    401,
    true
);

export const NoSuitableRoleFound = new AppError(
    "No suitable role found for your account",
    400,
    true
);

export const PasswordResetAttemptExpired = new AppError(
    "Your password reset attempt was not found or expired. Please try again",
    401,
    true
);

export const IncorrectOTP = new AppError(
    "Incorrect OTP",
    401,
    true
);

export const RestaurantDataRequiredError = new AppError(
    "Restaurant data is required",
    400,
    true
);