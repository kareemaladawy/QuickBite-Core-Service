import { MemberStatus } from "../enums";

export class RestaurantMember {
    id: number;
    restaurantId: number;
    userId: number;
    roleId: number;
    status: MemberStatus;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<RestaurantMember>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.userId = data.userId!;
        this.roleId = data.roleId!;
        this.status = data.status!;
        this.createdAt = data.createdAt!;
        this.updatedAt = data.updatedAt!;
    }
}