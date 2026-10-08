import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean } from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description is required' })
    description?: string;

    @IsString({ message: 'Image URL must be a string' })
    @IsNotEmpty({ message: 'Image URL is required' })
    imageUrl?: string;

    @IsString({ message: 'Category name must be a string' })
    @IsNotEmpty({ message: 'Category name is required' })
    categoryName!: string;
}

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    categoryName?: string;

    // branch-level overrides (requires branchId query param)
    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
