declare namespace Express {
    interface Request {
        correlationId?: string,
        user?: {
            id: number,
            role: string,
            email: string
        }
    }
}