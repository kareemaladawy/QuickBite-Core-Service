// Routing keys published to the `core.events` exchange. order-service's consumer
// binds `product.#`, `branch.#`, `restaurant.#`, `rbac.#` against these exact strings —
// keep the two sides in sync when adding a new type.
export enum CoreEventType {
    PRODUCT_STOCK_CHANGED = 'product.stock.changed',
    PRODUCT_PRICE_CHANGED = 'product.price.changed',
    BRANCH_UPDATED = 'branch.updated',
    BRANCH_DEACTIVATED = 'branch.deactivated',
    RESTAURANT_SUSPENDED = 'restaurant.suspended',
    RBAC_PERMISSIONS_CHANGED = 'rbac.permissions_changed',
}
