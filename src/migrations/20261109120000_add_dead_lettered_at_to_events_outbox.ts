import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("events_outbox", (table) => {
        table.timestamp("dead_lettered_at").nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("events_outbox", (table) => {
        table.dropColumn("dead_lettered_at");
    });
}
