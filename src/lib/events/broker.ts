import amqp, { ChannelModel, ConfirmChannel } from "amqplib";
import { env } from "../config/env";
import logger from "../logger/logger";

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;

async function getChannel(): Promise<ConfirmChannel> {
    if (channel) return channel;

    const conn = await amqp.connect(env.rabbitmq.url);
    const ch = await conn.createConfirmChannel();
    await ch.assertExchange(env.rabbitmq.coreEventsExchange, "topic", { durable: true });

    conn.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        connection = null;
        channel = null;
    });

    conn.on("error", (error: Error) => {
        logger.error("RabbitMQ connection error", { error: error.message });
    });

    connection = conn;
    channel = ch;

    return ch;
}

// routingKey is the outbox row's event_type (e.g. "product.stock.changed").
export async function publishCoreEvent(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    const ch = await getChannel();

    await new Promise<void>((resolve, reject) => {
        ch.publish(
            env.rabbitmq.coreEventsExchange,
            routingKey,
            Buffer.from(JSON.stringify(payload)),
            { contentType: "application/json", persistent: true },
            (error) => (error ? reject(error) : resolve())
        );
    });
}

export async function closeBroker(): Promise<void> {
    await channel?.close();
    await connection?.close();
    channel = null;
    connection = null;
}
