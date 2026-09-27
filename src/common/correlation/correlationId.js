const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
    req.correlationId = uuidv4()
    res.setHeader('X-Correlation-Id', uuidv4());
    next();
}