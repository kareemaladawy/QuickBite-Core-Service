import { Media } from "../entity/media.entity";
import { MediaOwnerType, MediaStatus } from "../enums";

export class MediaUploadResponseDTO {
    mediaId!: number;
    uploadUrl!: string;
    uploadFields!: Record<string, string>;

    static from(media: Media, uploadPost: { url: string, fields: Record<string, string> }): MediaUploadResponseDTO {
        const dto = new MediaUploadResponseDTO();
        dto.mediaId = media.id;
        dto.uploadUrl = uploadPost.url;
        dto.uploadFields = uploadPost.fields;
        return dto;
    }
}

export class MediaResponseDTO {
    id!: number;
    ownerType!: MediaOwnerType;
    ownerId!: number;
    uploadedBy!: number;
    status!: MediaStatus;
    url?: string;
    createdAt!: string;

    static from(media: Media, url?: string): MediaResponseDTO {
        const dto = new MediaResponseDTO();
        dto.id = media.id;
        dto.ownerType = media.ownerType;
        dto.ownerId = media.ownerId;
        dto.uploadedBy = media.uploadedBy;
        dto.status = media.status;
        dto.url = url;
        dto.createdAt = media.createdAt.toISOString();
        return dto;
    }
}
