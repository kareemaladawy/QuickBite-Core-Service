import { RabbitMQClient } from "../../pkg/messaging/rabbitmq.client";
import { env } from "../config/env";

export const messageBroker = new RabbitMQClient({
    url: env.rabbitmq.url,
    exchange: env.rabbitmq.coreEventsExchange,
});
