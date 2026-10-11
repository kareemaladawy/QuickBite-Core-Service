import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { SystemRole } from "../enums";

export class UpdateProfileDTO {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(11)
    phone?: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    systemRole: SystemRole;
}