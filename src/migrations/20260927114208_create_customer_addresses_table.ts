import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(
        `
            create table customer_addresses(
                id serial primary key,
                user_id bigint not null,
                label text not null,
                country text not null,
                city text not null,
                street text,
                building text,
                apartment_number text,
                type text not null check(type in ('home', 'office', 'public_place')),
                lat decimal(10, 7) not null,
                long decimal(10, 7) not null,
                is_default boolean not null,
                created_at timestamp not null,

                constraint fk_customer_addresses_user_id foreign key (user_id) references users(id) on delete cascade
            );

            create index idx_customer_addresses_user_id on customer_addresses(user_id);
        `
    );
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(
        `
            drop table customer_addresses;
        `
    )
}

