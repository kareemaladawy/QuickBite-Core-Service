import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE branches ALTER COLUMN commission_percentage TYPE decimal(5,2);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE branches ALTER COLUMN commission_percentage TYPE integer;
    `);
}

