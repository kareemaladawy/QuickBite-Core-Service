import { DeleteObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type { IStorageProvider, PresignedUploadPost, StoredObjectInfo } from "./s3.interface";

export interface S3StorageProviderConfig {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}

export class S3StorageProvider implements IStorageProvider {
    private readonly client: S3Client;

    constructor(private readonly config: S3StorageProviderConfig) {
        this.client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }

    async getPresignedUploadPost(key: string, contentType: string, maxSizeBytes: number, expiresInSeconds = 900): Promise<PresignedUploadPost> {
        const { url, fields } = await createPresignedPost(this.client, {
            Bucket: this.config.bucket,
            Key: key,
            Conditions: [
                ["content-length-range", 0, maxSizeBytes],
                ["eq", "$Content-Type", contentType],
            ],
            Fields: {
                "Content-Type": contentType,
            },
            Expires: expiresInSeconds,
        });

        return { url, fields };
    }

    async statObject(key: string): Promise<StoredObjectInfo | null> {
        try {
            const result = await this.client.send(new HeadObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
            }));

            return {
                sizeBytes: result.ContentLength ?? 0,
                contentType: result.ContentType,
            };
        } catch (error: any) {
            if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
                return null;
            }

            throw error;
        }
    }

    async deleteObject(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.config.bucket,
            Key: key,
        }));
    }
}
