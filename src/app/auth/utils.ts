import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../../lib/config/env";
import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "./types";

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.bcryptSalt);
}

export async function comparePasswordHash(passwordInput: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(passwordInput, passwordHash);
}

export function generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
        expiresIn: env.jwt.accessExpiresIn
    };

    return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = {
        expiresIn: env.jwt.refreshExpiresIn
    };

    return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}

export async function generateOTP(): Promise<string> {
    return crypto.randomInt(1000, 9999).toString();
}

export async function hashOTP(otp: string): Promise<string> {
    return crypto.createHash("sha256").update(otp).digest("hex");
}