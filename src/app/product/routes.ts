import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/middleware/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { ProductController } from "./controller/product.controller";

export const productRouter = Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);

// public endpoints
productRouter.get('/restaurants/:restaurantId/categories', productController.findCategories);
productRouter.get('/branches/:branchId/products', productController.findByBranch);
productRouter.get('/products/:id', productController.findById);

productRouter.get(
    '/restaurants/:restaurantId/products',
    authenticate,
    requireRestaurantMember('restaurantId'),
    productController.findByRestaurant
);

productRouter.post(
    '/restaurants/:restaurantId/products',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({ resource: 'core:product', action: 'create' }),
    productController.create
);

productRouter.patch(
    '/branches/:branchId/products/:id',
    authenticate,
    requireBranchAccess('branchId'),
    rbac({ resource: 'core:product', action: 'update' }),
    productController.update
);
