export interface IMessageBroker {
    connect(): Promise<void>;
    publish(exchange: string, routingKey: string, payload: Record<string, unknown>): Promise<void>;
    close(): Promise<void>;
}
