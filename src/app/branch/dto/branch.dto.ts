import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CountryCode, Currency } from "../enums";

export class CreateBranchDTO {
    @IsEnum(CountryCode, { message: 'Invalid country code' })
    countryCode!: CountryCode;

    @IsEnum(Currency, { message: 'Invalid currency' })
    currency!: Currency;

    @IsNotEmpty()
    @IsString()
    label!: string;

    @IsString({ message: 'Address text must be a string' })
    addressText!: string;

    @IsNumber()
    lat!: number;
    @IsNumber()
    long!: number;

    @IsInt({ message: 'Delivery radius must be an integer' })
    @Min(0)
    deliveryRadius!: number;

    @IsString({ message: 'Opening hours must be a string' })
    opensAt!: string;

    @IsString({ message: 'Closing hours must be a string' })
    closesAt!: string;

    @IsOptional()
    @IsNumber()
    commissionPercentage?: number
}

export class UpdateBranchDetailsDTO {
    @IsString({ message: 'Address text must be a string' })
    @IsOptional()
    label?: string;

    @IsEnum(Currency, { message: 'Invalid currency' })
    @IsOptional()
    currency?: Currency;

    @IsString({ message: 'Address text must be a string' })
    @IsOptional()
    addressText?: string;

    @IsInt({ message: 'Delivery radius must be an integer' })
    @Min(0)
    @IsOptional()
    deliveryRadius!: number;

    @IsBoolean({ message: 'Accepts orders must be a boolean' })
    @IsOptional()
    acceptsOrders?: boolean;

    @IsString({ message: 'Opening hours must be a string' })
    @IsOptional()
    opensAt?: string;

    @IsString({ message: 'Closing hours must be a string' })
    @IsOptional()
    closesAt?: string;
}

export class UpdateBranchStatusDTO {
    @IsBoolean({ message: 'Is active must be a boolean' })
    @IsOptional()
    isActive?: boolean;

    @IsNumber({}, { message: 'Commission percentage must be a number' })
    @IsOptional()
    commissionPercentage?: number
}