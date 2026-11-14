import { db } from "../../src/lib/knex/knex";

export async function truncateAll(): Promise<void> {
    const result = await db.raw<{ rows: { tablename: string }[] }>(`select tablename from pg_tables
        where schemaname = 'public' and tablename not in ('knex_migrations', 'knex_migrations_lock');`);

    const tables = result.rows.map((r) => r.tablename).join(', ');

    await db.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE;`);
}