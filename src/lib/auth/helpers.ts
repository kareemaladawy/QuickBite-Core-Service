import { Response } from "express";
import { env } from "../config/env";
import { days, hours } from "../../pkg/utils/time";

export function setTokenCookies(accessToken: string, refreshToken: string, res: Response) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: hours(1)
    })

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        maxAge: days(7),
        path: "/api/v1/auth/refresh"
    })
}