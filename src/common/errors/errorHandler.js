const logger = require('../logger/logger');

module.exports = (err, req, res, next) => {
    const operational = err.isOperational;

    logger.error(err.message, {
        statusCode: err.statusCode,
        stack: err.stack,
        operational: operational,
        correlationId: req.correlationId
    });

    if (operational) {
        return res.status(err.statusCode).json({
            error: err.message,

        });
    }

    return res.status(500).json({
        error: 'Internal server error',
    });
}