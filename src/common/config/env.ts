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
    BCRYPT_SALT: z.string().default("10"),
    ACCESS_SECRET: z.string(),
    REFRESH_SECRET: z.string(),
    ACCESS_EXPIRES_IN: z.string().default("3600"),
    REFRESH_EXPIRES_IN: z.string().default("60480"),
    NODE_ENV: z.enum(['local', 'development', 'production']),
    ACCESS_EXPIRES_IN_MS: z.string().default("3600000")
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
    jwt: {
        accessSecret: parsed.ACCESS_SECRET,
        refreshSecret: parsed.REFRESH_SECRET,
        accessExpiresIn: Number(parsed.ACCESS_EXPIRES_IN),
        refreshExpiresIn: Number(parsed.REFRESH_EXPIRES_IN),
    }
}