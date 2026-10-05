import { IsBoolean, IsDecimal, IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { AddressType } from "../enums";

export class CreateCustomerAddressDto {
    @Transform(({ value }) => value !== undefined && value !== null ? String(value) : value)
    @IsDecimal()
    lat!: number;
    @Transform(({ value }) => value !== undefined && value !== null ? String(value) : value)
    @IsDecimal()
    long!: number;

    @IsString()
    label!: string;

    @IsString()
    street!: string;
    @IsString()
    city!: string;
    @IsString()
    country!: string;

    @IsString()
    @IsOptional()
    building!: string;

    @IsString()
    @IsOptional()
    apartmentNumber!: string;

    @IsEnum(AddressType)
    type!: AddressType;

    @IsBoolean()
    isDefault!: boolean;
}

export class UpdateCustomerAddressDto {
    @Transform(({ value }) => value !== undefined && value !== null ? String(value) : value)
    @IsDecimal()
    @IsOptional()
    lat?: number;
    @Transform(({ value }) => value !== undefined && value !== null ? String(value) : value)
    @IsDecimal()
    @IsOptional()
    long?: number;

    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    street?: string;
    @IsString()
    @IsOptional()
    city?: string;
    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    building?: string;

    @IsString()
    @IsOptional()
    apartmentNumber?: string;

    @IsEnum(AddressType)
    @IsOptional()
    type?: AddressType;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}