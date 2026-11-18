import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("restaurants", (table) => {
        table.string("logo_url").nullable().alter();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("restaurants", (table) => {
        table.string("logo_url").notNullable().alter();
    });
}
