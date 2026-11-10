import { Restaurant } from "../entity/restaurant.entity";

// Consumed by order-service's core-client (restaurant.client.ts) to resolve the ledger
// account id for a restaurant's transactions.src_acc_id/dst_acc_id — field names/shape
// are a cross-service contract, don't rename lightly.
export class InternalRestaurantResponseDTO {
    id!: number;
    ownerId!: number;

    static from(restaurant: Restaurant): InternalRestaurantResponseDTO {
        const dto = new InternalRestaurantResponseDTO();
        dto.id = restaurant.id;
        dto.ownerId = restaurant.ownerId;
        return dto;
    }
}
