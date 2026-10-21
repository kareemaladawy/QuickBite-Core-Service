import { RestaurantNotFoundError } from "../../restaurant/errors";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { insufficientStockError, ProductNotFoundError, releaseStockFailedError } from "../errors";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { createProduct, findProductById, findProductsByBranch, findProductsByBranchAndIds, findProductsByRestaurant, updateProduct } from "../repository/product.repository";
import { findCategoryByName, findCategoriesByRestaurant, createCategory } from "../repository/category.repository";
import { releaseStock, reserveStock, ReserveStockItemInput, updateBranchDetails } from "../repository/product-branch.repository";
import { db } from "../../../lib/knex/knex";
import { injectable } from "tsyringe";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { CoreEventType } from "../../../lib/events/event-types";

@injectable()
export class ProductService {
    create = async (restaurantId: number, data: CreateProductDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        let categoryId: number | null = null;

        const transaction = await db.transaction();

        try {
            if (data.categoryName) {
                let category = await findCategoryByName(restaurantId, data.categoryName);
                if (!category) {
                    category = await createCategory(restaurantId, data.categoryName, transaction);
                }
                categoryId = category.id;
            }

            const product = await createProduct({
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                restaurantId,
                categoryId,
            }, transaction);

            await transaction.commit();

            return product;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    findByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        return await findProductsByRestaurant(restaurantId);
    }

    findCategories = async (restaurantId: number) => {
        return await findCategoriesByRestaurant(restaurantId);
    }

    findByBranch = async (branchId: number) => {
        return await findProductsByBranch(branchId);
    }

    findByBranchAndIds = async (branchId: number, productIds: number[]) => {
        return await findProductsByBranchAndIds(branchId, productIds);
    }

    reserveStock = async (branchId: number, items: ReserveStockItemInput[]): Promise<void> => {
        const transaction = await db.transaction();

        try {
            const failures = await reserveStock(branchId, items, transaction);

            if (failures.length > 0) {
                throw insufficientStockError(failures);
            }

            for (const item of items) {
                await insertOutboxEvent(transaction, {
                    aggregateType: "product_branch",
                    aggregateId: item.productId,
                    eventType: CoreEventType.PRODUCT_STOCK_CHANGED,
                    payload: { productId: item.productId, branchId },
                });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    releaseStock = async (branchId: number, items: ReserveStockItemInput[]): Promise<void> => {
        const transaction = await db.transaction();

        try {
            const failures = await releaseStock(branchId, items, transaction);

            if (failures.length > 0) {
                throw releaseStockFailedError(failures);
            }

            for (const item of items) {
                await insertOutboxEvent(transaction, {
                    aggregateType: "product_branch",
                    aggregateId: item.productId,
                    eventType: CoreEventType.PRODUCT_STOCK_CHANGED,
                    payload: { productId: item.productId, branchId },
                });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    findById = async (id: number) => {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }
        return product;
    }

    update = async (productId: number, userId: number, userRole: SystemRole, data: UpdateProductDTO, branchId?: number) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        const transaction = await db.transaction();

        try {
            let categoryId: number | undefined = undefined;
            if (data.categoryName) {
                let category = await findCategoryByName(product.restaurantId, data.categoryName);
                if (!category) {
                    category = await createCategory(product.restaurantId, data.categoryName, transaction);
                }
                categoryId = category.id;
            }

            const updatedProduct = await updateProduct(productId, {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                categoryId,
            }, transaction);

            let branchDetails;
            if (branchId && (data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined)) {
                branchDetails = await updateBranchDetails(branchId, productId, {
                    price: data.price,
                    stock: data.stock,
                    isAvailable: data.isAvailable,
                }, transaction);

                if (data.stock !== undefined) {
                    await insertOutboxEvent(transaction, {
                        aggregateType: "product_branch",
                        aggregateId: productId,
                        eventType: CoreEventType.PRODUCT_STOCK_CHANGED,
                        payload: { productId, branchId, stock: data.stock },
                    });
                }

                if (data.price !== undefined) {
                    await insertOutboxEvent(transaction, {
                        aggregateType: "product_branch",
                        aggregateId: productId,
                        eventType: CoreEventType.PRODUCT_PRICE_CHANGED,
                        payload: { productId, branchId, price: data.price },
                    });
                }
            }

            await transaction.commit();

            return { product: updatedProduct, branchDetails };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}