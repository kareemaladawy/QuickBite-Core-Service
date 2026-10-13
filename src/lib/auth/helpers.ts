import { Response } from "express";
import { env } from "../config/env";
import { toMs } from "../../pkg/utils/time";

export function setTokenCookies(accessToken: string, refreshToken: string, res: Response) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: toMs(1, 'h'),
    })

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: toMs(7, 'd'),
        path: "/api/v1/auth/refresh"
    })
}