import { CountryCode, Currency } from "../enums";

export class Branch {
    id: number;
    restaurantId: number;
    addressText: string;
    label: string;
    currency: Currency;
    countryCode: CountryCode;
    lat: number;
    long: number;
    opensAt: string;
    closesAt: string;
    isActive: boolean;
    acceptsOrders: boolean;
    deliveryRadius: number;
    commissionPercentage: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Branch>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.isActive = data.isActive!;
        this.addressText = data.addressText!;
        this.label = data.label!;
        this.currency = data.currency!;
        this.lat = data.lat!;
        this.long = data.long!;
        this.opensAt = data.opensAt!;
        this.closesAt = data.closesAt!;
        this.acceptsOrders = data.acceptsOrders!;
        this.countryCode = data.countryCode!;
        this.deliveryRadius = data.deliveryRadius ?? 0;
        this.commissionPercentage = data.commissionPercentage ?? 0;
        this.createdAt = data.createdAt!;
        this.updatedAt = data.updatedAt!;
    }
}