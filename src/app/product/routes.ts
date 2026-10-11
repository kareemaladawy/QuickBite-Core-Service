import { Router } from "express";
import { productController } from "./controller/product.controller";
import { authenticate } from "../../common/auth/middleware/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../common/auth/middleware/rbac";

export const productRouter = Router();

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
