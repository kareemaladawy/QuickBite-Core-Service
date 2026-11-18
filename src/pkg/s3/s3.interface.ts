export interface PresignedUploadPost {
    url: string;
    fields: Record<string, string>;
}

export interface StoredObjectInfo {
    sizeBytes: number;
    contentType?: string;
}

export interface IStorageProvider {
    getPresignedUploadPost(key: string, contentType: string, maxSizeBytes: number, expiresInSeconds?: number): Promise<PresignedUploadPost>;
    statObject(key: string): Promise<StoredObjectInfo | null>;
    deleteObject(key: string): Promise<void>;
}
