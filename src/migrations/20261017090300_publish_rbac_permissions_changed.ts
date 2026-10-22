import type { Knex } from "knex";
import { insertOutboxEvent } from "../lib/events/outbox.repo";
import { CoreEventType } from "../lib/events/event-types";

// Catch-up publish: the rbac data seeded by 20261010040724_seed_rbac_data.ts and
// 20261017090100_seed_order_service_permissions.ts predates events_outbox (created by
// 20261017090200), so neither could announce the catalog it wrote. order-service's
// core:rbac:perms:<roleName> read-through cache needs one invalidation now to drop
// whatever it populated from core-service before this migration ran.
//
// Any future migration that adds/removes rows in permissions or role_permission must
// insert a matching RBAC_PERMISSIONS_CHANGED outbox event in the same transaction.
export async function up(knex: Knex): Promise<void> {
    await insertOutboxEvent(knex, {
        aggregateType: "rbac",
        aggregateId: 0,
        eventType: CoreEventType.RBAC_PERMISSIONS_CHANGED,
        payload: { roles: ["owner", "branch_manager", "staff"] },
    });
}

export async function down(): Promise<void> {
    // No-op: the event itself isn't a durable fact worth retracting, and the outbox row
    // may already have been dispatched/drained by the time this migration is rolled back.
}
