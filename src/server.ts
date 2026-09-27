import http from 'http';
import { createApp } from './app.js';
import { env } from './common/config/env.js';
import { db } from './common/knex/knex.js';

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, () => console.log("Server listening on port " + env.port + " now"));

async function shutDown() {
    server.close(async () => await db.destroy());
    console.log('DB shutdown');
    process.exit(0);
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);