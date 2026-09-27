import { config } from "dotenv";
import path from "path";
import { z } from "zod";

// always resolve the .env correctly regardless of what tool uses this file
config({ path: path.resolve(import.meta.dirname, '../../../.env') });

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
})

const parsed = schema.parse(process.env);

export const env = {
    port: Number(parsed.PORT),
    db: {
        host: parsed.DB_HOST,
        port: Number(parsed.DB_PORT),
        username: parsed.DB_USERNAME,
        password: parsed.DB_PASSWORD,
        name: parsed.DB_NAME,
        poolMax: Number(parsed.DB_MAX_POOL),
        // F:\workspace\quickbite\core-service\src\migrations
        migrationsDir: path.resolve(import.meta.dirname, '../../../', parsed.DB_MIGRATIONS_DIR),
        migrationsExt: parsed.DB_MIGRATIONS_EXTENTION,
    }
}