import { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError } from "../errors";
import { verifyAccessToken } from "../../../app/auth/utils";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: NotAuthenticatedError.message });
    }

    try {
        req.user = verifyAccessToken(accessToken);

    } catch (error) {
        return res.status(401).json({ error: NotAuthenticatedError.message });
    }

    next();
}