import { Request, Response, NextFunction } from "express";
import { validateBody } from "../../../lib/validation/validate";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductService } from "../service/product.service";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendCreated, sendSuccess } from "../../../lib/http/response";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.create(
                Number(req.params.restaurantId),
                data,
            );

            sendCreated(res, product);
        } catch (error) {
            next(error);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const products = await this.productService.findByRestaurant(
                Number(req.params.restaurantId),
                req.user?.userId!,
                req.user?.role! as SystemRole,
            );

            sendSuccess(res, products);
        } catch (error) {
            next(error);
        }
    }

    findCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await this.productService.findCategories(Number(req.params.restaurantId));

            sendSuccess(res, categories);
        } catch (error) {
            next(error);
        }
    }

    findByBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findByBranch(Number(req.params.branchId));

            sendSuccess(res, results);
        } catch (error) {
            next(error);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await this.productService.findById(Number(req.params.id));

            sendSuccess(res, product);
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateProductDTO, req.body);
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;

            await this.productService.update(
                Number(req.params.id),
                req.user?.userId!,
                req.user?.role! as SystemRole,
                data,
                branchId,
            );

            sendSuccess(res, { message: "Product updated" });
        } catch (error) {
            next(error);
        }
    }
}