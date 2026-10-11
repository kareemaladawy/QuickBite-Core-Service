import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("roles", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.string("display_name").notNullable();
        table.string("description").nullable();
        table.timestamps(true, true);

        table.unique("name");
    });

    await knex.schema.createTable("permissions", (table) => {
        table.increments("id").primary();
        table.string("resource").notNullable();
        table.string("action").notNullable();
        table.timestamp("created_at").notNullable();

        table.unique(["resource", "action"]);
    });

    await knex.schema.createTable("role_permission", (table) => {
        table.smallint("role_id").notNullable();
        table.foreign("role_id").references("id").inTable("roles").onDelete("CASCADE");

        table.integer("permission_id").notNullable();
        table.foreign("permission_id").references("id").inTable("permissions").onDelete("CASCADE");

        table.primary(["role_id", "permission_id"]);
    });

    // restaurant & restaurant members related

    await knex.schema.createTable("restaurant_members", (table) => {
        table.bigIncrements("id").primary();

        table.integer("restaurant_id").notNullable();
        table.foreign("restaurant_id").references("id").inTable("restaurants").onDelete("CASCADE");

        table.bigInteger("user_id").notNullable();
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");

        table.smallint("role_id").notNullable();
        table.foreign("role_id").references("id").inTable("roles").onDelete("CASCADE");

        table.string("status").notNullable();
        table.timestamps(true, true);

        table.unique(["restaurant_id", "user_id"]);

        table.index("restaurant_id");
        table.index("user_id");
        table.index("status");
    });

    await knex.schema.createTable("member_branch", (table) => {
        table.bigInteger("member_id").notNullable();
        table.foreign("member_id").references("id").inTable("restaurant_members").onDelete("CASCADE");

        table.bigInteger("branch_id").notNullable();
        table.foreign("branch_id").references("id").inTable("branches").onDelete("CASCADE");

        table.primary(["member_id", "branch_id"]);

        table.index("member_id");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("role_permission");
    await knex.schema.dropTableIfExists("permissions");
    await knex.schema.dropTableIfExists("member_branch");
    await knex.schema.dropTableIfExists("restaurant_members");
}

