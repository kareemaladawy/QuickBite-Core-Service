import { RestaurantStatus } from "../enums";

export class Restaurant {
    id: number;
    ownerId: number;
    name: string;
    primaryRegion: string;
    status: RestaurantStatus;
    logoURL: string;
    statusUpdatedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Restaurant>) {
        this.id = data.id!;
        this.name = data.name!;
        this.ownerId = data.ownerId!;
        this.primaryRegion = data.primaryRegion!;
        this.logoURL = data.logoURL!;
        this.status = data.status!;
        this.statusUpdatedAt = data.statusUpdatedAt!;
        this.createdAt = data.createdAt!;
        this.updatedAt = data.updatedAt!;
    }
}