import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { InvalidApiKeyError } from "../errors";

export function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
    try {
        const apiKey = req.header("api-key");

        if (!apiKey || apiKey !== env.internal.apiKey) {
            throw InvalidApiKeyError;
        }

        next();
    } catch (error) {
        next(error);
    }
}
