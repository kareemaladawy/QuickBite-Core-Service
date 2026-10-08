import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`CREATE EXTENSION postgis;`);

    await knex.schema.createTable("branches", (table) => {
        table.increments("id").primary();
        table.bigInteger("restaurant_id").notNullable();
        table.foreign("restaurant_id").references("id").inTable("restaurants").onDelete("CASCADE");
        table.string("country_code").notNullable();
        table.string("currency").notNullable();
        table.string("label").notNullable();
        table.string("address_text").notNullable();
        table.decimal("lat", 9, 6).notNullable();
        table.decimal("long", 9, 6).notNullable();
        table.smallint("delivery_radius").notNullable();
        table.boolean("is_active").notNullable();
        table.boolean("accepts_orders").notNullable();
        table.decimal("commission_percentage", 5, 2).nullable();

        table.time("opens_at").notNullable();
        table.time("closes_at").notNullable();
        table.timestamps(true, true);

        table.index("restaurant_id");
        table.index("is_active");
    });

    await knex.raw(`
        ALTER TABLE branches ADD COLUMN location geography(Point, 4326) GENERATED ALWAYS AS (ST_MakePoint(long::float, lat::float)) STORED;
        CREATE INDEX idx_branches_location ON branches USING GIST(location);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("branches");
}

