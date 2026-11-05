export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    restaurantId?: number,
    restaurantRole?: string,
    branchIds?: number[],
}
