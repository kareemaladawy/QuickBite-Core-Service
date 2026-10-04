import logger from '../logger/logger.js';
import AppError from './AppError.js';
import type { Request, Response, NextFunction } from 'express';


export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
    const operational = err.isOperational;

    logger.error(err.message, {
        statusCode: err.statusCode,
        stack: err.stack,
        operational: operational,
        correlationId: req.correlationId
    });

    if (operational) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    return res.status(500).json({
        error: 'An internal server error occured. Please try again later',
    });
}