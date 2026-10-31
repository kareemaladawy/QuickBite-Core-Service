import type { Knex } from "knex";

// Adds 'delivery_agent' to the users.system_role whitelist — needed so order-service's
// Phase 3 agent presence/assignment flow has a real system_role to authenticate against
// (order-service's JWT gate checks req.user.role === 'delivery_agent'; see
// order-service/src/app/agent/routes.ts's requireAgentRole). Dynamically finds the
// anonymous CHECK constraint's actual name rather than assuming Postgres's default
// naming (<table>_<column>_check), since that's an implementation detail, not a
// documented guarantee.
export async function up(knex: Knex): Promise<void> {
    const { rows } = await knex.raw(`
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'users'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) LIKE '%system_role%'
    `);

    for (const row of rows) {
        await knex.raw(`ALTER TABLE users DROP CONSTRAINT "${row.conname}"`);
    }

    await knex.raw(`
        ALTER TABLE users ADD CONSTRAINT users_system_role_check
        CHECK (system_role IN ('customer', 'restaurant_user', 'system_admin', 'delivery_agent'));
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE users DROP CONSTRAINT users_system_role_check;`);
    await knex.raw(`
        ALTER TABLE users ADD CONSTRAINT users_system_role_check
        CHECK (system_role IN ('customer', 'restaurant_user', 'system_admin'));
    `);
}
