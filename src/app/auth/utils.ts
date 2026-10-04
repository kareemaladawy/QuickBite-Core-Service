import bcrypt from "bcrypt";
import { env } from "../../common/config/env";
import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
}

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