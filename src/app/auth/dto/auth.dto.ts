import { IsEmail, IsString, IsStrongPassword, MinLength, MaxLength, IsEnum } from "class-validator";
import { SystemRole } from "../../user/enums";

export class RegisterDTO {
    @IsString()
    @MinLength(1)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }, {
        message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.'
    })
    password!: string;

    @IsString()
    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsEnum(SystemRole)
    role!: SystemRole;
}