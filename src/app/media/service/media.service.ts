import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { JwtPayload } from "../../auth/types";
import { TOKENS } from "../../../lib/di/tokens";
import { SystemRole } from "../../user/enums";
import type { IStorageProvider, PresignedUploadPost } from "../../../pkg/s3/s3.interface";
import { RequestMediaUploadDTO } from "../dto/media.dto";
import { Media } from "../entity/media.entity";
import { MediaOwnerType, MediaStatus } from "../enums";
import { MediaNotFoundError, MediaNotUploadedError, MediaOwnershipError } from "../errors";
import { createMedia, findMediaById, updateMediaStatus } from "../repository/media.repo";

const ownerPathPrefixes: Record<MediaOwnerType, string> = {
    [MediaOwnerType.RESTAURANT]: "restaurants",
    [MediaOwnerType.USER]: "users",
};

@injectable()
export class MediaService {
    constructor(
        @inject(TOKENS.StorageProvider) private readonly storageProvider: IStorageProvider,
        @inject(TOKENS.CdnUrl) private readonly cdnUrl: string,
        @inject(TOKENS.S3MaxUploadSizeBytes) private readonly maxUploadSizeBytes: number,
    ) { }

    requestUpload = async (ownerType: MediaOwnerType, ownerId: number, uploadedBy: number, data: RequestMediaUploadDTO): Promise<{ media: Media, uploadPost: PresignedUploadPost }> => {
        const path = `${ownerPathPrefixes[ownerType]}/${ownerId}/media/${uuidv4()}-${data.fileName}`;

        const media = await createMedia(new Media({
            ownerType,
            ownerId,
            uploadedBy,
            status: MediaStatus.PENDING,
            path,
        }));

        const uploadPost = await this.storageProvider.getPresignedUploadPost(
            path,
            data.contentType,
            this.maxUploadSizeBytes
        );

        return { media, uploadPost };
    }

    confirmUpload = async (mediaId: number, user: JwtPayload): Promise<Media> => {
        const media = await this.findMediaById(mediaId);

        this.assertOwnership(media, user);

        const storedObject = await this.storageProvider.statObject(media.path);
        if (!storedObject) {
            throw MediaNotUploadedError;
        }

        await updateMediaStatus(media.id, MediaStatus.UPLOADED);
        media.status = MediaStatus.UPLOADED;

        return media;
    }

    findMediaById = async (id: number): Promise<Media> => {
        const media = await findMediaById(id);

        if (!media) {
            throw MediaNotFoundError;
        }

        return media;
    }

    getMediaUrl = (media: Media): string => {
        return `${this.cdnUrl}/${media.path}`;
    }

    private assertOwnership = (media: Media, user: JwtPayload): void => {
        if (user.role === SystemRole.SYSTEM_ADMIN) {
            return;
        }

        if (media.ownerType === MediaOwnerType.RESTAURANT && Number(user.restaurantId) === Number(media.ownerId)) {
            return;
        }

        if (media.ownerType === MediaOwnerType.USER && Number(user.userId) === Number(media.ownerId)) {
            return;
        }

        throw MediaOwnershipError;
    }
}
