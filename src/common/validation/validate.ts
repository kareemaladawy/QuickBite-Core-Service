import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import AppError from "../errors/AppError";

export async function validateBody<T extends Object>(cls: new () => T, body: unknown): Promise<T> {
    const instance: T = plainToInstance(cls, body && typeof body === "object" ? body : {});
    const errors = await validate(instance, { whitelist: true });

    if (errors.length > 0) {
        const messages = errors.flatMap((e): string[] => Object.values(e.constraints ?? []));
        throw new AppError(messages.join(", "), 400);
    }

    return instance;
}