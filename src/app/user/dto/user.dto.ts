import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDTO {
    @IsString()
    @MinLength(1)
    @IsOptional()
    name!: string;

    @IsString()
    @MinLength(10)
    @MaxLength(11)
    @IsOptional()
    phone!: string;
}