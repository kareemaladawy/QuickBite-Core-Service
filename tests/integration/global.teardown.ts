import "./register-ts-resolve"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, "../../.env.test") })

export default async function globalTeardown() {
    // destroy database connection
    const { db } = require("../../src/lib/knex/knex")
    await db.destroy()
}