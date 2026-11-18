import { MediaOwnerType, MediaStatus } from "../enums";

export class Media {
    id: number;
    ownerType: MediaOwnerType;
    ownerId: number;
    uploadedBy: number;
    status: MediaStatus;
    path: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Media>) {
        this.id = data.id!;
        this.ownerType = data.ownerType!;
        this.ownerId = data.ownerId!;
        this.uploadedBy = data.uploadedBy!;
        this.status = data.status!;
        this.path = data.path!;
        this.createdAt = data.createdAt!;
        this.updatedAt = data.updatedAt!;
    }
}
