import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { RestaurantStatus } from "../enums";

export class UpdateRestaurantStatusDto {
    @IsString()
    @IsEnum(RestaurantStatus, { message: 'Invalid restaurant status' })
    status!: RestaurantStatus;
}

export class UpdateRestaurantDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    primaryRegion?: string;

    @IsUrl()
    @IsOptional()
    logoURL?: string;
}