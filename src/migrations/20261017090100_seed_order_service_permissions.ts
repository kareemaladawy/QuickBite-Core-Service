import type { Knex } from "knex";

const NEW_PERMISSIONS: Array<[string, string]> = [
    ["core:order", "read"],
    ["core:order", "accept"],
    ["core:order", "update"],
    ["core:order", "cancel"],
    ["core:payment", "read"],
    ["core:payment", "refund"],
    ["core:delivery", "assign"],
    ["core:finance", "read"],
    ["core:finance", "payout_create"],
];

export async function up(knex: Knex): Promise<void> {
    // Permissions consumed by order-service (orders/payments/deliveries/restaurant-finance).
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
        ('core:order', 'read', NOW()),
        ('core:order', 'accept', NOW()),
        ('core:order', 'update', NOW()),
        ('core:order', 'cancel', NOW()),

        ('core:payment', 'read', NOW()),
        ('core:payment', 'refund', NOW()),

        ('core:delivery', 'assign', NOW()),

        ('core:finance', 'read', NOW()),
        ('core:finance', 'payout_create', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // Owner gets all of the new permissions.
    await knex.raw(`
        INSERT INTO role_permission (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'owner'
        AND p.resource || ':' || p.action IN (
            'core:order:read',
            'core:order:accept',
            'core:order:update',
            'core:order:cancel',
            'core:payment:read',
            'core:payment:refund',
            'core:delivery:assign',
            'core:finance:read',
            'core:finance:payout_create'
        )
        ON CONFLICT DO NOTHING;
    `);

    // Branch manager: order lifecycle + read-only finance.
    await knex.raw(`
        INSERT INTO role_permission (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'branch_manager'
        AND p.resource || ':' || p.action IN (
            'core:order:read',
            'core:order:accept',
            'core:order:update',
            'core:order:cancel',
            'core:finance:read'
        )
        ON CONFLICT DO NOTHING;
    `);

    // Staff: day-to-day order handling, no cancel, no finance.
    await knex.raw(`
        INSERT INTO role_permission (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'staff'
        AND p.resource || ':' || p.action IN (
            'core:order:read',
            'core:order:accept',
            'core:order:update'
        )
        ON CONFLICT DO NOTHING;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DELETE FROM role_permission
        WHERE permission_id IN (
            SELECT id FROM permissions WHERE (resource, action) IN (
                ${NEW_PERMISSIONS.map(([resource, action]) => `('${resource}', '${action}')`).join(",\n                ")}
            )
        );
    `);

    await knex.raw(`
        DELETE FROM permissions WHERE (resource, action) IN (
            ${NEW_PERMISSIONS.map(([resource, action]) => `('${resource}', '${action}')`).join(",\n            ")}
        );
    `);
}
