import "./register-ts-resolve"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, "../../.env.test") })

export default async function globalSetup() {
    // migrate database
    const { db } = require("../../src/lib/knex/knex")
    await db.migrate.latest()
}