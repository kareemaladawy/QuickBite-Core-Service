import { Knex } from "knex";
import { randomUUID } from "crypto";

const outboxColumns = [
    "id",
    "aggregate_type",
    "aggregate_id",
    "event_type",
    "event_id",
    "payload",
    "attempts",
];

export interface OutboxEventInput {
    aggregateType: string;
    aggregateId: number;
    eventType: string;
    payload: Record<string, unknown>;
}

export interface OutboxEventRow {
    id: number;
    aggregateType: string;
    aggregateId: number;
    eventType: string;
    eventId: string;
    payload: Record<string, unknown>;
    attempts: number;
}

function toEntity(row: any): OutboxEventRow {
    return {
        id: row.id,
        aggregateType: row.aggregate_type,
        aggregateId: row.aggregate_id,
        eventType: row.event_type,
        eventId: row.event_id,
        payload: row.payload,
        attempts: row.attempts,
    };
}

// Called by domain services inside the same DB transaction as the mutation they describe.
export async function insertOutboxEvent(transaction: Knex, data: OutboxEventInput): Promise<void> {
    await transaction("events_outbox").insert({
        aggregate_type: data.aggregateType,
        aggregate_id: data.aggregateId,
        event_type: data.eventType,
        event_id: randomUUID(),
        payload: JSON.stringify(data.payload),
        created_at: new Date(),
    });
}

// Row-locks a batch for the draining worker; SKIP LOCKED makes concurrent worker instances safe.
export async function claimUndispatchedEvents(transaction: Knex, limit: number): Promise<OutboxEventRow[]> {
    const rows = await transaction("events_outbox")
        .whereNull("dispatched_at")
        .orderBy("id", "asc")
        .limit(limit)
        .forUpdate()
        .skipLocked()
        .select(outboxColumns);

    return rows.map(toEntity);
}

export async function markEventDispatched(transaction: Knex, id: number): Promise<void> {
    await transaction("events_outbox")
        .where("id", id)
        .update({ dispatched_at: new Date() });
}

export async function markEventFailed(transaction: Knex, id: number, error: string): Promise<void> {
    await transaction("events_outbox")
        .where("id", id)
        .increment("attempts", 1)
        .update({ last_error: error });
}
