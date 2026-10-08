import { Request, Response, NextFunction } from "express";
import { validateBody } from "../../../common/validation/validate";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductService, productService } from "../service/product.service";

export class ProductController {
    constructor(private readonly productService: ProductService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.create(
                Number(req.params.restaurantId),
                req.user?.userId!,
                req.user?.role! as SystemRole,
                data,
            );

            res.status(201).json({ data: product });
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

            res.status(200).json({ data: products });
        } catch (error) {
            next(error);
        }
    }

    findCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const products = await this.productService.findCategories(Number(req.params.restaurantId));

            res.status(200).json({ data: products });
        } catch (error) {
            next(error);
        }
    }

    findByBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findByBranch(Number(req.params.branchId));

            res.status(200).json({ data: results });
        } catch (error) {
            next(error);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await this.productService.findById(Number(req.params.id));

            res.status(200).json({ data: product });
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

            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController(productService);
