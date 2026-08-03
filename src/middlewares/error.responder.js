const { logger } = require("../config/logger.config");

const errorResponder = (err, req, res, next) => {
  const isValidHttpCode =
    typeof err.code === "number" &&
    Number.isInteger(err.code) &&
    err.code >= 400 &&
    err.code <= 599;

  const statusCode = isValidHttpCode ? err.code : 500;

  if (statusCode === 500) {
    logger.error({ err }, "Internal server error");
  }

  const error = {
    success: false,
    body: {
      code: statusCode,
      message:
        statusCode === 500 ? "Internal server error" : err.message || null,
      details: statusCode === 500 ? null : err.details || null,
    },
  };

  res.status(statusCode).json(error);
};

module.exports = errorResponder;
