import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("events_outbox", (table) => {
        table.bigIncrements("id").primary();
        table.string("aggregate_type").notNullable();
        table.bigInteger("aggregate_id").notNullable();
        table.string("event_type").notNullable();
        table.uuid("event_id").notNullable();
        table.jsonb("payload").notNullable();
        table.timestamp("created_at").notNullable();
        table.timestamp("dispatched_at").nullable();
        table.integer("attempts").notNullable().defaultTo(0);
        table.text("last_error").nullable();

        table.unique(["event_id"]);
        // supports the drain query: WHERE dispatched_at IS NULL ORDER BY id FOR UPDATE SKIP LOCKED
        table.index(["dispatched_at", "id"], "idx_events_outbox_dispatched_at_id");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("events_outbox");
}
