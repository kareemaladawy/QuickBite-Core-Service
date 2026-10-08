import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("product_branch", (table) => {
        table.bigIncrements("id").primary();
        table.bigInteger("product_id").notNullable();
        table.foreign("product_id").references("id").inTable("products").onDelete("CASCADE");
        table.bigInteger("branch_id").notNullable();
        table.foreign("branch_id").references("id").inTable("branches").onDelete("CASCADE");
        table.integer("price").notNullable();
        table.integer("stock").notNullable();
        table.boolean("is_available").notNullable();
        table.timestamps(true, true);
        table.unique(["product_id", "branch_id"]);

        table.index("branch_id");
        table.index("product_id");
    });

    await knex.raw(`
        -- Trigger: auto-insert product_branch for all branches when a product is created
        CREATE OR REPLACE FUNCTION fn_insert_product_branch()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO product_branch (branch_id, product_id, price, stock, is_available)
            SELECT id, NEW.id, 0, 0, false
            FROM branches
            WHERE restaurant_id = NEW.restaurant_id;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_product_after_insert
        AFTER INSERT ON products
        FOR EACH ROW
        EXECUTE FUNCTION fn_insert_product_branch();    
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("product_branch");

    await knex.raw(`
        DROP TRIGGER IF EXISTS trg_product_after_insert ON products;
        DROP FUNCTION IF EXISTS fn_insert_product_branch;
    `);
}

