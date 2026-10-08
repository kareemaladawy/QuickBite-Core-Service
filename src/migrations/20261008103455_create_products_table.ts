import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("products", (table) => {
        table.bigIncrements("id").primary();
        table.bigInteger("category_id").notNullable();
        table.foreign("category_id").references("id").inTable("product_categories").onDelete("CASCADE");
        table.bigInteger("restaurant_id").notNullable();
        table.foreign("restaurant_id").references("id").inTable("restaurants").onDelete("CASCADE");
        table.string("name").notNullable();
        table.string("description").notNullable();
        table.string("image_url").notNullable();
        table.timestamps(true, true);
        table.timestamp("deleted_at").nullable();

        table.index("restaurant_id");
        table.index("category_id");
        table.index("deleted_at");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("products");
}

