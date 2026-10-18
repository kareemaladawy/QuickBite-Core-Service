import { Branch } from "../entity/branch.entity";
import { CountryCode, Currency } from "../enums";
import { NearbyBranchRow } from "../types";

export class BranchResponseDTO {
    id!: number;
    restaurantId!: number;
    label!: string;
    addressText!: string;
    countryCode!: CountryCode;
    currency!: Currency;
    lat!: number;
    long!: number;
    opensAt!: string;
    closesAt!: string;
    isActive!: boolean;
    acceptsOrders!: boolean;
    deliveryRadius!: number;
    commissionPercentage!: number;
    deliveryFee!: number;
    createdAt!: string;
    updatedAt!: string;

    static from(branch: Branch): BranchResponseDTO {
        const dto = new BranchResponseDTO();
        dto.id = branch.id;
        dto.restaurantId = branch.restaurantId;
        dto.label = branch.label;
        dto.addressText = branch.addressText;
        dto.countryCode = branch.countryCode;
        dto.currency = branch.currency;
        dto.lat = branch.lat;
        dto.long = branch.long;
        dto.opensAt = branch.opensAt;
        dto.closesAt = branch.closesAt;
        dto.isActive = branch.isActive;
        dto.acceptsOrders = branch.acceptsOrders;
        dto.deliveryRadius = branch.deliveryRadius;
        dto.commissionPercentage = branch.commissionPercentage;
        dto.deliveryFee = branch.deliveryFee;
        dto.createdAt = branch.createdAt.toISOString();
        dto.updatedAt = branch.updatedAt.toISOString();
        return dto;
    }
}

export class NearbyBranchResponseDTO {
    label!: string;
    restaurantName!: string;
    restaurantLogoUrl!: string;
    addressText!: string;
    opensAt!: string;
    closesAt!: string;
    acceptsOrders!: boolean;
    countryCode!: CountryCode;
    currency!: Currency;

    static from(row: NearbyBranchRow): NearbyBranchResponseDTO {
        const dto = new NearbyBranchResponseDTO();
        dto.label = row.lable;
        dto.restaurantName = row.restaurantName;
        dto.restaurantLogoUrl = row.restaurantLogoUrl;
        dto.addressText = row.addressText;
        dto.opensAt = row.opensAt;
        dto.closesAt = row.closesAt;
        dto.acceptsOrders = row.acceptsOrders;
        dto.countryCode = row.countryCode;
        dto.currency = row.currency;
        return dto;
    }
}
