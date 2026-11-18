import { Knex } from "knex";
import { Media } from "../entity/media.entity";
import { db } from "../../../lib/knex/knex";
import { MediaStatus } from "../enums";

const mediaColumns = [
    "id",
    "owner_type",
    "owner_id",
    "uploaded_by",
    "status",
    "path",
    "created_at",
    "updated_at",
];

function toEntity(row: any): Media {
    return new Media({
        id: row.id,
        ownerType: row.owner_type,
        ownerId: row.owner_id,
        uploadedBy: row.uploaded_by,
        status: row.status,
        path: row.path,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createMedia(data: Partial<Media>, transaction: Knex = db): Promise<Media> {
    const now = new Date();
    const [row] = await transaction("media").insert({
        owner_type: data.ownerType,
        owner_id: data.ownerId,
        uploaded_by: data.uploadedBy,
        status: data.status,
        path: data.path,
        created_at: now,
        updated_at: now,
    }).returning(mediaColumns);

    return toEntity(row);
}

export async function updateMediaStatus(id: number, status: MediaStatus, transaction: Knex = db): Promise<void> {
    await transaction("media")
        .where("id", id)
        .update({
            status,
            updated_at: new Date(),
        });
}

export async function findMediaById(id: number): Promise<Media | undefined> {
    const row = await db("media").where("id", id).select(mediaColumns).first();

    return row ? toEntity(row) : undefined;
}
