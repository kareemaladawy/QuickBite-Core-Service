import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(
        `
            create table users(
                id serial primary key,
                email text not null unique,
                phone text not null unique,
                name text not null,
                password_hash text not null,
                system_role text not null check(system_role in ('customer', 'restaurant_user', 'system_admin')),
                created_at timestamp not null,
                updated_at timestamp,
                deleted_at timestamp
            );
            
            create index idx_users_email on users(email);
            create index idx_users_system_role on users(system_role);
        `
    );
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(
        `
            drop table users;
        `
    );
}

