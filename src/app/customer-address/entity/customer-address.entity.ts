export class CustomerAddress {
    id: number;
    userId: number;
    label: string;
    country: string;
    city: string;
    street: string | null;
    building: string | null;
    apartmentNumber: string | null;
    type: string;
    lat: number;
    long: number;
    isDefault: boolean;
    createdAt: Date;

    constructor(data: Partial<CustomerAddress>) {
        this.id = data.id!;
        this.userId = data.userId!;
        this.label = data.label!;
        this.country = data.country!;
        this.city = data.city!;
        this.street = data.street ?? null;
        this.building = data.building ?? null;
        this.apartmentNumber = data.apartmentNumber ?? null;
        this.type = data.type!;
        this.lat = data.lat!;
        this.long = data.long!;
        this.isDefault = data.isDefault!;
        this.createdAt = data.createdAt!;
    }
}