import { Knex } from "knex";
import { randomUUID } from "crypto";
import { CoreEventType } from "./event-types";

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
    eventType: CoreEventType;
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
        .whereNull("dead_lettered_at")
        .orderBy("id", "asc")
        .limit(limit)
        .forUpdate()
        .skipLocked()
        .select(outboxColumns);

    return rows.map(toEntity);
}

export async function markEventsDispatched(transaction: Knex, ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await transaction("events_outbox")
        .whereIn("id", ids)
        .update({ dispatched_at: new Date() });
}

export interface OutboxFailure {
    id: number;
    error: string;
}

// One UPDATE ... FROM (VALUES ...) for the whole batch instead of one query per failed event.
// A row whose attempts (after this increment) reach maxAttempts is dead-lettered so a
// permanently-broken event (bad payload, unknown routing key) stops being reclaimed every
// tick and can't starve healthy events behind it in the id-ordered claim query.
export async function markEventsFailed(transaction: Knex, failures: OutboxFailure[], maxAttempts: number): Promise<void> {
    if (failures.length === 0) return;

    const values = failures.map((f) => `(?::bigint, ?::text)`).join(", ");
    const bindings = failures.flatMap((f) => [f.id, f.error.slice(0, 2000)]);

    await transaction.raw(
        `
        UPDATE events_outbox eo
        SET attempts = eo.attempts + 1,
            last_error = v.last_error,
            dead_lettered_at = CASE WHEN eo.attempts + 1 >= ? THEN now() ELSE eo.dead_lettered_at END
        FROM (VALUES ${values}) AS v(id, last_error)
        WHERE eo.id = v.id
        `,
        [maxAttempts, ...bindings]
    );
}
