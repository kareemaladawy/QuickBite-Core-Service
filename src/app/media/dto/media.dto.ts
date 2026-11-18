import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AllowedMediaContentType } from "../enums";

export class RequestMediaUploadDTO {
    @IsNotEmpty()
    @IsString()
    fileName!: string;

    @IsEnum(AllowedMediaContentType)
    contentType!: AllowedMediaContentType;
}
