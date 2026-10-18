import amqp, { ChannelModel, ConfirmChannel } from "amqplib";
import { IMessageBroker } from "./message-broker.interface";

export interface RabbitMQConfig {
    url: string;
    exchange: string;
}

export class RabbitMQClient implements IMessageBroker {
    private connection: ChannelModel | null = null;
    private channel: ConfirmChannel | null = null;

    constructor(private readonly config: RabbitMQConfig) { }

    async connect(): Promise<void> {
        if (this.channel) return;

        const conn = await amqp.connect(this.config.url);
        const ch = await conn.createConfirmChannel();
        await ch.assertExchange(this.config.exchange, "topic", { durable: true });

        conn.on("close", () => {
            console.error("RabbitMQ connection closed");
            this.connection = null;
            this.channel = null;
        });

        conn.on("error", (err) => console.error("RabbitMQ connection error:", err));

        this.connection = conn;
        this.channel = ch;
    }

    async publish(exchange: string, routingKey: string, payload: Record<string, unknown>): Promise<void> {
        await this.connect();
        const ch = this.channel!;

        await new Promise<void>((resolve, reject) => {
            ch.publish(
                exchange,
                routingKey,
                Buffer.from(JSON.stringify(payload)),
                { contentType: "application/json", persistent: true },
                (error) => (error ? reject(error) : resolve())
            );
        });
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
        this.channel = null;
        this.connection = null;
    }
}
