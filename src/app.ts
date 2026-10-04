import express from 'express';
import { routes } from './routes.js';
import { errorHandler } from './common/errors/errorHandler.js';
import { correlationId } from './common/correlation/correlationId.js';

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(correlationId);
    app.use('/api/v1', routes);
    app.use(errorHandler);

    return app;
}