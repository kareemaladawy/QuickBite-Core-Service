import logger from '../logger/logger.js';
import AppError from './AppError.js';
import type { Request, Response, NextFunction } from 'express';


export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode ?? err.status;
    const operational = err.isOperational || (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500);

    logger.error(err.message, {
        statusCode,
        stack: err.stack,
        operational: operational,
        correlationId: req.correlationId
    });

    if (operational) {
        return res.status(statusCode ?? 400).json({
            error: err.message,
        });
    }

    return res.status(500).json({
        error: 'An internal server error occured. Please try again later',
    });
}