import type { Knex } from "knex";
import { insertOutboxEvent } from "../lib/events/outbox.repo";
import { CoreEventType } from "../lib/events/event-types";

const NEW_PERMISSIONS: Array<[string, string]> = [["analytics", "read"]];

export async function up(knex: Knex): Promise<void> {
    // Permission consumed by analytics-service for its read-only
    // /api/v1/analytics/... endpoints (app/analytics/enums.go PermAnalyticsRead).
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
        ('analytics', 'read', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // Owner and branch manager can read rollups; staff cannot.
    await knex.raw(`
        INSERT INTO role_permission (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name IN ('owner', 'branch_manager')
        AND p.resource || ':' || p.action = 'analytics:read'
        ON CONFLICT DO NOTHING;
    `);

    // Any migration that changes permissions/role_permission must announce it —
    // see 20261017090300_publish_rbac_permissions_changed.ts's comment. Without
    // this, analytics-service's (and order-service's) RBAC cache stays stale
    // until its TTL expires.
    await insertOutboxEvent(knex, {
        aggregateType: "rbac",
        aggregateId: 0,
        eventType: CoreEventType.RBAC_PERMISSIONS_CHANGED,
        payload: { roles: ["owner", "branch_manager"] },
    });
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
