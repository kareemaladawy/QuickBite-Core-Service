import "reflect-metadata";
import { Cron } from "croner";
import { env } from "./lib/config/env";
import { db } from "./lib/knex/knex";
import { claimUndispatchedEvents, markEventDispatched, markEventFailed } from "./lib/events/outbox.repo";
import { publishCoreEvent, closeBroker } from "./lib/events/broker";
import logger from "./lib/logger/logger";

async function drainOutbox(): Promise<void> {
    const transaction = await db.transaction();

    try {
        const events = await claimUndispatchedEvents(transaction, env.outbox.batchSize);

        for (const event of events) {
            try {
                await publishCoreEvent(event.eventType, {
                    eventId: event.eventId,
                    aggregateType: event.aggregateType,
                    aggregateId: event.aggregateId,
                    eventType: event.eventType,
                    payload: event.payload,
                });
                await markEventDispatched(transaction, event.id);
            } catch (error) {
                await markEventFailed(transaction, event.id, (error as Error).message);
            }
        }

        await transaction.commit();

        if (events.length > 0) {
            logger.info("Outbox drained", { count: events.length });
        }
    } catch (error) {
        await transaction.rollback();
        logger.error("Outbox drain failed", { error: (error as Error).message });
    }
}

const job = new Cron(env.outbox.drainCron, drainOutbox);

logger.info("Outbox worker started", { cron: env.outbox.drainCron });

async function shutDown() {
    job.stop();
    await closeBroker();
    await db.destroy();
    logger.info("Outbox worker shutdown");
    process.exit(0);
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
