import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";

// product.controller.ts imports ProductService, which imports the real knex db module —
// mock it out so this test doesn't need a real DB connection / validated env.
vi.mock("../../../lib/knex/knex", () => ({
    db: { transaction: vi.fn() },
}));

import { ProductController } from "./product.controller";

function createMockRes() {
    return { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
}

describe("ProductController#update", () => {
    let productService: { update: ReturnType<typeof vi.fn> };
    let controller: ProductController;

    beforeEach(() => {
        productService = { update: vi.fn().mockResolvedValue({ product: {}, branchDetails: undefined }) };
        controller = new ProductController(productService as any);
    });

    it("reads branchId from the route param, not the query string", async () => {
        const req = {
            params: { id: "100", branchId: "7" },
            query: {},
            body: { price: 20 },
            user: { userId: 1, role: "owner" },
        } as any;
        const res = createMockRes();
        const next = vi.fn();

        await controller.update(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(productService.update).toHaveBeenCalledWith(100, 1, "owner", expect.objectContaining({ price: 20 }), 7);
    });

    it("passes undefined branchId when the route has no branchId param", async () => {
        const req = {
            params: { id: "100" },
            query: { branchId: "7" }, // should be ignored — branchId only ever comes from the route param
            body: { name: "New name" },
            user: { userId: 1, role: "owner" },
        } as any;
        const res = createMockRes();
        const next = vi.fn();

        await controller.update(req, res, next);

        expect(productService.update).toHaveBeenCalledWith(100, 1, "owner", expect.objectContaining({ name: "New name" }), undefined);
    });
});
