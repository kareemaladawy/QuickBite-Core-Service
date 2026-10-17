import { config } from "dotenv";
import path from "path";
import { z } from "zod";

config({ path: path.resolve(__dirname, '../../../.env') });

const schema = z.object({
    PORT: z.string().default("3000"),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.string().default("5432"),
    DB_USERNAME: z.string().default("root"),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_MAX_POOL: z.string().default("10"),
    DB_MIGRATIONS_DIR: z.string(),
    DB_MIGRATIONS_EXTENTION: z.string(),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.string().default("6379"),
    REDIS_PASSWORD: z.string().default(""),
    BCRYPT_SALT: z.string().default("10"),
    ACCESS_SECRET: z.string(),
    REFRESH_SECRET: z.string(),
    ACCESS_EXPIRES_IN: z.string().default("3600"),
    REFRESH_EXPIRES_IN: z.string().default("60480"),
    NODE_ENV: z.enum(['local', 'development', 'production']),
    ACCESS_EXPIRES_IN_MS: z.string().default("3600000"),
    CORS_ORIGINS: z.string().default("http://localhost:3000"),

    MAILJET_FROM_NAME: z.string(),
    MAILJET_FROM_EMAIL: z.string(),
    MAILJET_API_KEY: z.string(),
    MAILJET_API_SECRET: z.string(),

    INTERNAL_API_KEY: z.string(),

    RABBITMQ_URL: z.string(),
    RABBITMQ_CORE_EVENTS_EXCHANGE: z.string().default("core.events"),
    OUTBOX_DRAIN_CRON: z.string().default("*/10 * * * * *"),
    OUTBOX_BATCH_SIZE: z.string().default("50"),
})

const parsed = schema.parse(process.env);

export const env = {
    port: Number(parsed.PORT),
    bcryptSalt: Number(parsed.BCRYPT_SALT),
    nodeEnv: parsed.NODE_ENV,
    accessExpiresInMs: parsed.ACCESS_EXPIRES_IN_MS,
    db: {
        host: parsed.DB_HOST,
        port: Number(parsed.DB_PORT),
        username: parsed.DB_USERNAME,
        password: parsed.DB_PASSWORD,
        name: parsed.DB_NAME,
        poolMax: Number(parsed.DB_MAX_POOL),
        migrationsDir: path.resolve(__dirname, '../../../', parsed.DB_MIGRATIONS_DIR),
        migrationsExt: parsed.DB_MIGRATIONS_EXTENTION,
    },
    redis: {
        host: parsed.REDIS_HOST,
        port: Number(parsed.REDIS_PORT),
        password: parsed.REDIS_PASSWORD
    },
    jwt: {
        accessSecret: parsed.ACCESS_SECRET,
        refreshSecret: parsed.REFRESH_SECRET,
        accessExpiresIn: Number(parsed.ACCESS_EXPIRES_IN),
        refreshExpiresIn: Number(parsed.REFRESH_EXPIRES_IN),
    },
    cors: {
        origins: parsed.CORS_ORIGINS.split(',')
    },
    mailjet: {
        fromName: parsed.MAILJET_FROM_NAME,
        fromEmail: parsed.MAILJET_FROM_EMAIL,
        apiKey: parsed.MAILJET_API_KEY,
        apiSecret: parsed.MAILJET_API_SECRET
    },
    internal: {
        apiKey: parsed.INTERNAL_API_KEY,
    },
    rabbitmq: {
        url: parsed.RABBITMQ_URL,
        coreEventsExchange: parsed.RABBITMQ_CORE_EVENTS_EXCHANGE,
    },
    outbox: {
        drainCron: parsed.OUTBOX_DRAIN_CRON,
        batchSize: Number(parsed.OUTBOX_BATCH_SIZE),
    },
}