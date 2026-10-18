import "reflect-metadata";
import { Cron } from "croner";
import { env } from "./lib/config/env";
import { db } from "./lib/knex/knex";
import { claimUndispatchedEvents, markEventsDispatched, markEventsFailed, OutboxFailure } from "./lib/events/outbox.repo";
import { messageBroker } from "./lib/events/init";
import logger from "./lib/logger/logger";

async function drainOutbox(): Promise<void> {
    const transaction = await db.transaction();

    try {
        const events = await claimUndispatchedEvents(transaction, env.outbox.batchSize);

        if (events.length === 0) {
            await transaction.commit();
            return;
        }

        // Probe the connection once so a dead broker fails this tick immediately
        // instead of making every event in the batch retry its own connect timeout.
        try {
            await messageBroker.connect();
        } catch (error) {
            const message = (error as Error).message;
            logger.error("RabbitMQ unreachable, deferring batch", { error: message, count: events.length });

            await markEventsFailed(transaction, events.map((event) => ({ id: event.id, error: message })));
            await transaction.commit();
            return;
        }

        const dispatchedIds: number[] = [];
        const failures: OutboxFailure[] = [];

        for (const event of events) {
            try {
                await messageBroker.publish(env.rabbitmq.coreEventsExchange, event.eventType, {
                    eventId: event.eventId,
                    aggregateType: event.aggregateType,
                    aggregateId: event.aggregateId,
                    eventType: event.eventType,
                    payload: event.payload,
                });
                dispatchedIds.push(event.id);
            } catch (error) {
                const message = (error as Error).message;
                logger.warn("Outbox event dispatch failed", { eventId: event.eventId, eventType: event.eventType, error: message });
                failures.push({ id: event.id, error: message });
            }
        }

        // One bulk UPDATE per outcome instead of one query per event.
        await markEventsDispatched(transaction, dispatchedIds);
        await markEventsFailed(transaction, failures);

        await transaction.commit();
        logger.info("Outbox drained", { dispatched: dispatchedIds.length, failed: failures.length });
    } catch (error) {
        await transaction.rollback();
        logger.error("Outbox drain failed", { error: (error as Error).message });
    }
}

// protect: skip a tick instead of overlapping with a still-running drain (e.g. a large backlog).
const job = new Cron(env.outbox.drainCron, { protect: true }, drainOutbox);

logger.info("Outbox worker started", { cron: env.outbox.drainCron });

async function shutDown() {
    job.stop();
    try {
        await messageBroker.close();
    } catch (error) {
        logger.error("Outbox worker shutdown failed at messageBroker.close", { error: (error as Error).message });
    }
    try {
        await db.destroy();
    } catch (error) {
        logger.error("Outbox worker shutdown failed at db.destroy", { error: (error as Error).message });
    }
    logger.info("Outbox worker shutdown");
    process.exit(0);
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
