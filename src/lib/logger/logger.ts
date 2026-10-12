export class Logger {
    private static instance: Logger;

    constructor() {
        if (!Logger.instance) {
            Logger.instance = this;
        }

        return Logger.instance;
    }

    log(level: string, message: string, metaData: Record<string, unknown> = {}) {
        const logObj = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...metaData
        }

        console.log(JSON.stringify(logObj));
    }

    info(message: string, metaData: Record<string, unknown> = {}) {
        this.log('INFO', message, metaData);
    }

    error(message: string, metaData: Record<string, unknown> = {}) {
        this.log('ERROR', message, metaData);
    }

    warn(message: string, metaData: Record<string, unknown> = {}) {
        this.log('WARN', message, metaData);
    }

    debug(message: string, metaData: Record<string, unknown> = {}) {
        this.log('DEBUG', message, metaData);
    }
}

const logger = new Logger();

export default logger;