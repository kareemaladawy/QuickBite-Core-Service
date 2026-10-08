import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("product_categories", (table) => {
        table.bigIncrements("id").primary();
        table.bigInteger("restaurant_id").notNullable();
        table.foreign("restaurant_id").references("id").inTable("restaurants").onDelete("CASCADE");
        table.string("name").notNullable();
        table.timestamps(true, true);

        table.index("restaurant_id");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("product_categories");
}

