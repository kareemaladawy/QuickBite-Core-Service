import express from 'express';
import cors from 'cors';
import { routes } from './routes.js';
import { errorHandler } from './lib/errors/errorHandler.js';
import { correlationId } from './lib/correlation/correlationId.js';
import cookieParser from 'cookie-parser';
import { env } from './lib/config/env.js';
import helmet from 'helmet';

export function createApp() {
    const app = express();

    app.use(helmet());

    app.use(cors({
        origin: env.cors.origins,
        credentials: true // allow cookies
    }));

    app.set('query parser', 'extended');
    app.use(express.json());
    app.use(cookieParser());
    app.use(correlationId);
    app.use('/api/v1', routes);
    app.use(errorHandler);

    return app;
}