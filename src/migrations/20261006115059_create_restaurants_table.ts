import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("restaurants", (table) => {
        table.increments("id").primary();
        table.bigInteger("owner_id").notNullable();
        table.foreign("owner_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("name").notNullable();
        table.string("status").notNullable().checkIn(["active", "pending", "inactive", "suspended"]);
        table.timestamp("status_updated_at").nullable();
        table.string("logo_url").notNullable();
        table.string("primary_region").notNullable();
        table.timestamps(true, true);

        table.index("owner_id");
        table.index("primary_region");
        table.index("status");
        table.index("created_at");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("restaurants");
}

