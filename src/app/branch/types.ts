import { CountryCode, Currency } from "./enums";

// Shape returned by branch.repo.ts#findNearbyBranches — a join projection, not a Branch entity.
export interface NearbyBranchRow {
    id: number;
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

// Shape returned by branch.repo.ts#findBranchWithRestaurantStatusById — a join projection, not a Branch entity.
export interface BranchWithRestaurantStatusRow {
    id: number;
    restaurant_id: number;
    restaurant_status: string;
    accepts_orders: boolean;
    is_active: boolean;
    delivery_fee: number;
    commission_percentage: number | null;
    currency: string;
    lat: number;
    long: number;
    label: string;
    address_text: string;
    country_code: string;
}
