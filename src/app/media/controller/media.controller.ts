import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendCreated, sendSuccess } from "../../../lib/http/response";
import { validateBody } from "../../../lib/validation/validate";
import { RequestMediaUploadDTO } from "../dto/media.dto";
import { MediaResponseDTO, MediaUploadResponseDTO } from "../dto/media.response.dto";
import { MediaOwnerType } from "../enums";
import { MediaService } from "../service/media.service";

@injectable()
export class MediaController {
    constructor(
        @inject(TOKENS.MediaService) private readonly mediaService: MediaService,
    ) { }

    requestRestaurantUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const uploadedBy = Number(req.user?.userId);
            const validated = await validateBody(RequestMediaUploadDTO, req.body);

            const { media, uploadPost } = await this.mediaService.requestUpload(
                MediaOwnerType.RESTAURANT,
                restaurantId,
                uploadedBy,
                validated
            );

            sendCreated(res, MediaUploadResponseDTO.from(media, uploadPost));
        } catch (error) {
            next(error);
        }
    };

    requestProfileUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = Number(req.user?.userId);
            const validated = await validateBody(RequestMediaUploadDTO, req.body);

            const { media, uploadPost } = await this.mediaService.requestUpload(
                MediaOwnerType.USER,
                userId,
                userId,
                validated
            );

            sendCreated(res, MediaUploadResponseDTO.from(media, uploadPost));
        } catch (error) {
            next(error);
        }
    };

    confirmUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mediaId = Number(req.params.mediaId);
            const media = await this.mediaService.confirmUpload(mediaId, req.user!);

            sendSuccess(res, MediaResponseDTO.from(media));
        } catch (error) {
            next(error);
        }
    };

    findMediaById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mediaId = Number(req.params.mediaId);
            const media = await this.mediaService.findMediaById(mediaId);
            const url = this.mediaService.getMediaUrl(media);

            sendSuccess(res, MediaResponseDTO.from(media, url));
        } catch (error) {
            next(error);
        }
    };
}
