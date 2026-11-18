import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("media", (table) => {
        table.increments("id").primary();
        table.string("owner_type").notNullable().checkIn(["restaurant", "user"]);
        table.bigInteger("owner_id").notNullable();
        table.bigInteger("uploaded_by").notNullable();
        table.foreign("uploaded_by").references("id").inTable("users").onDelete("CASCADE");
        table.string("status").notNullable().checkIn(["pending", "uploaded", "failed"]);
        table.string("path").notNullable();
        table.timestamps(true, true);

        table.index(["owner_type", "owner_id"]);
        table.index("status");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("media");
}
