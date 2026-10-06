import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

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