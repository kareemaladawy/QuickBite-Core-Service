import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";

const trx = { commit: vi.fn(), rollback: vi.fn() };

vi.mock("../../../lib/knex/knex", () => ({
    db: { transaction: vi.fn(async () => trx) },
}));

vi.mock("../../../lib/events/outbox.repo", () => ({
    insertOutboxEvent: vi.fn(),
}));

vi.mock("../../restaurant/repository/restaurant.repo", () => ({
    findRestaurantById: vi.fn(async () => ({ id: 1 })),
}));

vi.mock("../repository/category.repository", () => ({
    findCategoryByName: vi.fn(async () => ({ id: 10 })),
    findCategoriesByRestaurant: vi.fn(),
    createCategory: vi.fn(async () => ({ id: 10 })),
}));

vi.mock("../repository/product.repository", () => ({
    createProduct: vi.fn(async () => ({ id: 100 })),
    findProductById: vi.fn(async () => ({ id: 100, restaurantId: 1 })),
    findProductsByBranch: vi.fn(),
    findProductsByBranchAndIds: vi.fn(),
    findProductsByRestaurant: vi.fn(),
    updateProduct: vi.fn(async () => ({ id: 100, name: "Updated name" })),
}));

vi.mock("../repository/product-branch.repository", () => ({
    reserveStock: vi.fn(async () => ({ failures: [], updated: [{ productId: 100, stock: 5, isAvailable: true }] })),
    releaseStock: vi.fn(async () => ({ failures: [], updated: [{ productId: 100, stock: 5, isAvailable: true }] })),
    updateBranchDetails: vi.fn(async () => ({ id: 1, price: 20, stock: 5, isAvailable: true })),
}));

import { ProductService } from "./product.service";
import { reserveStock, releaseStock } from "../repository/product-branch.repository";

function createMockCacheProvider() {
    return { get: vi.fn(), set: vi.fn(), del: vi.fn() };
}

describe("ProductService cache invalidation", () => {
    let cacheProvider: ReturnType<typeof createMockCacheProvider>;
    let service: ProductService;

    beforeEach(() => {
        vi.clearAllMocks();
        cacheProvider = createMockCacheProvider();
        service = new ProductService(cacheProvider as any);
    });

    it("invalidates the restaurant products and categories list on create", async () => {
        await service.create(1, { name: "Burger", categoryName: "Mains" } as any);

        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/restaurants/1/products");
        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/restaurants/1/categories");
    });

    it("does not invalidate the categories cache on create without a category", async () => {
        await service.create(1, { name: "Burger" } as any);

        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/restaurants/1/products");
        expect(cacheProvider.del).not.toHaveBeenCalledWith("GET:/api/v1/restaurants/1/categories");
    });

    it("refreshes the product cache and invalidates restaurant/branch list caches on update with branch overrides", async () => {
        await service.update(100, 1, "owner" as any, { price: 15, categoryName: "Mains" } as any, 7);

        expect(cacheProvider.set).toHaveBeenCalledWith(
            "GET:/api/v1/products/100",
            JSON.stringify({ data: { id: 100, name: "Updated name" } }),
            expect.any(Number),
        );
        expect(cacheProvider.del).not.toHaveBeenCalledWith("GET:/api/v1/products/100");
        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/restaurants/1/products");
        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/restaurants/1/categories");
        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/branches/7/products");
    });

    it("refreshes the product cache but does not touch the branch cache on update without a branchId", async () => {
        await service.update(100, 1, "owner" as any, { name: "New name" } as any);

        expect(cacheProvider.set).toHaveBeenCalledWith(
            "GET:/api/v1/products/100",
            JSON.stringify({ data: { id: 100, name: "Updated name" } }),
            expect.any(Number),
        );
        expect(cacheProvider.del).not.toHaveBeenCalledWith(expect.stringContaining("/branches/"));
    });

    it("invalidates the branch products cache on successful stock reservation", async () => {
        await service.reserveStock(7, [{ productId: 100, quantity: 1 }]);

        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/branches/7/products");
    });

    it("invalidates the branch products cache on successful stock release", async () => {
        await service.releaseStock(7, [{ productId: 100, quantity: 1 }]);

        expect(cacheProvider.del).toHaveBeenCalledWith("GET:/api/v1/branches/7/products");
    });

    it("does not invalidate the cache when a stock reservation fails", async () => {
        (reserveStock as any).mockResolvedValueOnce({
            failures: [{ productId: 100, requested: 5, available: 1 }],
            updated: [],
        });

        await expect(service.reserveStock(7, [{ productId: 100, quantity: 5 }])).rejects.toThrow();

        expect(cacheProvider.del).not.toHaveBeenCalled();
        expect(trx.rollback).toHaveBeenCalled();
    });

    it("does not invalidate the cache when a stock release fails", async () => {
        (releaseStock as any).mockResolvedValueOnce({
            failures: [{ productId: 100 }],
            updated: [],
        });

        await expect(service.releaseStock(7, [{ productId: 100, quantity: 5 }])).rejects.toThrow();

        expect(cacheProvider.del).not.toHaveBeenCalled();
        expect(trx.rollback).toHaveBeenCalled();
    });
});
