class Logger {
    constructor() {
        if (!Logger.instance) {
            Logger.instance = this;
        }

        return Logger.instance;
    }

    log(level, message, metaData = {}) {
        const logObj = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...metaData
        }

        console.log(JSON.stringify(logObj));
    }

    info(message, metaData = {}) {
        this.log('INFO', message, metaData);
    }

    error(message, metaData = {}) {
        this.log('ERROR', message, metaData);
    }

    warn(message, metaData = {}) {
        this.log('WARN', message, metaData);
    }

    debug(message, metaData = {}) {
        this.log('DEBUG', message, metaData);
    }
}

const logger = new Logger();
module.exports = logger;