import { IsArray, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { MemberRole, MemberStatus } from "../enums";

export class CreateRestaurantMemberDTO {
    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(MemberRole, { message: 'Invalid member role' })
    role!: string;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    branchIds?: number[];
}

export class UpdateRestaurantMemberDTO {
    @IsString()
    @IsOptional()
    @IsEnum(MemberRole, { message: 'Invalid member role' })
    role?: string;

    @IsString()
    @IsOptional()
    @IsEnum(MemberStatus, { message: 'Invalid member status' })
    status?: string;
}

export class SetRestaurantMemberBranchesDTO {
    @IsArray({ message: 'Branch ids must be an array' })
    @IsNotEmpty({ message: 'Branch ids are required' })
    @IsNumber({}, { each: true, message: 'Branch ids must be numbers' })
    branchIds!: number[];
}