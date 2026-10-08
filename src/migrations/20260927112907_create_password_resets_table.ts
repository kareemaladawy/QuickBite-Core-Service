import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(
        `
            create table password_resets(
                id serial primary key,
                user_id bigint not null,
                otp_hash text not null,
                expires_at timestamp not null,
                created_at timestamp not null,
                consumed_at timestamp,

                constraint fk_password_resets_user_id foreign key (user_id) references users(id) on delete cascade
            );

            create index idx_password_resets_user_id on password_resets(user_id);
        `
    );
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(
        `
            drop table password_resets;
        `
    );
}

