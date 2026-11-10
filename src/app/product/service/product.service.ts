import { RestaurantNotFoundError } from "../../restaurant/errors";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { insufficientStockError, ProductNotFoundError, releaseStockFailedError } from "../errors";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { createProduct, findProductById, findProductsByBranch, findProductsByBranchAndIds, findProductsByRestaurant, updateProduct } from "../repository/product.repository";
import { findCategoryByName, findCategoriesByRestaurant, createCategory } from "../repository/category.repository";
import { releaseStock, reserveStock, updateBranchDetails } from "../repository/product-branch.repository";
import { ReserveStockItemInput } from "../types";
import { db } from "../../../lib/knex/knex";
import { inject, injectable } from "tsyringe";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { CoreEventType } from "../../../lib/events/event-types";
import { TOKENS } from "../../../lib/di/tokens";
import { ICacheProvider } from "../../../pkg/cache/cache.interface";
import { Product } from "../entity/product.entity";
import { toMs } from "../../../pkg/utils/time";

// mirrors the keys withCache() derives for the product GET routes
const productByIdCacheKey = (productId: number): string => `GET:/api/v1/products/${productId}`;
const productsByRestaurantCacheKey = (restaurantId: number): string => `GET:/api/v1/restaurants/${restaurantId}/products`;
const categoriesByRestaurantCacheKey = (restaurantId: number): string => `GET:/api/v1/restaurants/${restaurantId}/categories`;
const productsByBranchCacheKey = (branchId: number): string => `GET:/api/v1/branches/${branchId}/products`;

// matches the TTL withCache() applies to GET /products/:id (see product/routes.ts)
const PRODUCT_CACHE_TTL = toMs(1, 'h');

@injectable()
export class ProductService {
    constructor(@inject(TOKENS.CacheProvider) private readonly cacheProvider: ICacheProvider) { }

    // writes the fresh product straight into the cache slot GET /products/:id would have
    // populated, instead of deleting it — avoids a cache-miss round trip to the DB right
    // after every update, at the cost of this staying correct only as long as the cached
    // shape here (`{ data: <product> }`) matches what ProductController#findById sends.
    refreshProductCache = async (product: Product): Promise<void> => {
        await this.cacheProvider.set(productByIdCacheKey(product.id), JSON.stringify({ data: product }), PRODUCT_CACHE_TTL);
    }

    invalidateRestaurantProductsCache = async (restaurantId: number): Promise<void> => {
        await this.cacheProvider.del(productsByRestaurantCacheKey(restaurantId));
    }

    invalidateRestaurantCategoriesCache = async (restaurantId: number): Promise<void> => {
        await this.cacheProvider.del(categoriesByRestaurantCacheKey(restaurantId));
    }

    invalidateBranchProductsCache = async (branchId: number): Promise<void> => {
        await this.cacheProvider.del(productsByBranchCacheKey(branchId));
    }

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

            await this.invalidateRestaurantProductsCache(restaurantId);
            if (data.categoryName) {
                await this.invalidateRestaurantCategoriesCache(restaurantId);
            }

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
            const { failures, updated } = await reserveStock(branchId, items, transaction);

            if (failures.length > 0) {
                throw insufficientStockError(failures);
            }

            for (const item of updated) {
                await insertOutboxEvent(transaction, {
                    aggregateType: "product_branch",
                    aggregateId: item.productId,
                    eventType: CoreEventType.PRODUCT_STOCK_CHANGED,
                    payload: { productId: item.productId, branchId, stock: item.stock, isAvailable: item.isAvailable },
                });
            }

            await transaction.commit();

            await this.invalidateBranchProductsCache(branchId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    releaseStock = async (branchId: number, items: ReserveStockItemInput[]): Promise<void> => {
        const transaction = await db.transaction();

        try {
            const { failures, updated } = await releaseStock(branchId, items, transaction);

            if (failures.length > 0) {
                throw releaseStockFailedError(failures);
            }

            for (const item of updated) {
                await insertOutboxEvent(transaction, {
                    aggregateType: "product_branch",
                    aggregateId: item.productId,
                    eventType: CoreEventType.PRODUCT_STOCK_CHANGED,
                    payload: { productId: item.productId, branchId, stock: item.stock, isAvailable: item.isAvailable },
                });
            }

            await transaction.commit();

            await this.invalidateBranchProductsCache(branchId);
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
                        payload: { productId, branchId, stock: branchDetails.stock, isAvailable: branchDetails.isAvailable },
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

            await this.refreshProductCache(updatedProduct);
            await this.invalidateRestaurantProductsCache(product.restaurantId);
            if (data.categoryName) {
                await this.invalidateRestaurantCategoriesCache(product.restaurantId);
            }
            if (branchId) {
                await this.invalidateBranchProductsCache(branchId);
            }

            return { product: updatedProduct, branchDetails };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}