import { CountryCode, Currency } from "./enums";

// Shape returned by branch.repo.ts#findNearbyBranches — a join projection, not a Branch entity.
export interface NearbyBranchRow {
    lable: string;
    restaurantName: string;
    restaurantLogoUrl: string;
    addressText: string;
    opensAt: string;
    closesAt: string;
    acceptsOrders: boolean;
    countryCode: CountryCode;
    currency: Currency;
}
