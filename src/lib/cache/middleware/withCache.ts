import { NextFunction, Request, Response } from "express";
import { hours } from "../../../pkg/utils/time";
import { TOKENS } from "../../di/tokens";
import { container } from "../../di/container";
import { ICacheProvider } from "../../../pkg/utils/cache/cache.interface";

export function withCache(ttl = hours(1), userScoped = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cacheProvider: ICacheProvider = container.resolve(TOKENS.CacheProvider);

            const base = `${req.method}:${req.originalUrl}`
            const key = userScoped ? `${req.user?.userId}:${base}` : base;

            const cachedResponse = await cacheProvider.get(key);

            if (cachedResponse) {
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(JSON.parse(cachedResponse));
            }

            // intercept the original response (we have access to it from the res object)
            const originalResponse = res.json.bind(res);

            res.json = (body: any) => {
                // store the intercepted response in the cache
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheProvider.set(key, JSON.stringify(body), ttl);
                    res.setHeader('X-Cache', 'MISS');
                }
                // return the original response
                return originalResponse(body);
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}