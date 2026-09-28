import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export function correlationId(req: Request, res: Response, next: NextFunction) {
    req.correlationId = uuidv4();
    res.setHeader('X-Correlation-Id', uuidv4());
    next();
}