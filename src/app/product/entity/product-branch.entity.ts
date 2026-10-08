export class ProductBranch {
    id: number;
    branchId: number;
    productId: number;
    price: number;
    stock: number;
    isAvailable: boolean;

    constructor(data: Partial<ProductBranch>) {
        this.id = data.id!;
        this.branchId = data.branchId!;
        this.productId = data.productId!;
        this.price = data.price ?? 0;
        this.stock = data.stock ?? 0;
        this.isAvailable = data.isAvailable ?? false;
    }
}
