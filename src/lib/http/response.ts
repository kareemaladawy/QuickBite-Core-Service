import { Response } from "express";
import { PaginationMeta } from "./pagination/cursor-pagination";

export interface ApiResponse {
    message?: string,
    data?: any,
    meta?: Object
}

export function sendSuccess(res: Response, data: any, statusCode = 200) {
    const payload: ApiResponse = data.message ? { message: data.message } : { data };

    res.status(statusCode).json(payload);
}

export function sendCreated(res: Response, data: any) {
    sendSuccess(res, data, 201);
}

export function sendPaginated(res: Response, data: any, meta: PaginationMeta) {
    res.status(200).json({ data, meta });
}

export function sendNoContent(res: Response) {
    res.status(204).send();
}