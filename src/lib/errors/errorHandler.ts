import logger from '../logger/logger.js';
import AppError from './AppError.js';
import type { Request, Response, NextFunction } from 'express';

// Postgres error codes for malformed input values (e.g. a cursor/filter value
// that can't be cast to the target column's type) - these are client mistakes,
// not server failures, so they should surface as 400s.
const PG_BAD_INPUT_CODES = new Set([
    '22P02', // invalid_text_representation
    '22007', // invalid_datetime_format
    '22003', // numeric_value_out_of_range
    '22P03', // invalid_binary_representation
]);

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = err.statusCode ?? err.status;
    let message = err.message;

    if (!statusCode && PG_BAD_INPUT_CODES.has(err.code)) {
        statusCode = 400;
        message = 'Invalid query parameter value';
    }

    const operational = err.isOperational || (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500);

    logger.error(err.message, {
        statusCode,
        stack: err.stack,
        operational: operational,
        correlationId: req.correlationId
    });

    if (operational) {
        return res.status(statusCode ?? 400).json({
            error: message,
        });
    }

    return res.status(500).json({
        error: 'An internal server error occured. Please try again later',
    });
}