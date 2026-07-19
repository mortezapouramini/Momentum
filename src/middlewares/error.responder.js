const errorResponder = (err, req, res, next) => {
  const isValidHttpCode =
    typeof err.code === "number" &&
    Number.isInteger(err.code) &&
    err.code >= 400 &&
    err.code <= 599;

  const statusCode = isValidHttpCode ? err.code : 500;

  const error = {
    success: false,
    body: {
      code: statusCode,
      message: statusCode === 500 ? "Internal server error" : err.message || null,
      details: statusCode === 500 ? null : err.details || null,
    },
  };

  console.error(err); // Logger


  res.status(statusCode).json(error);
};

module.exports = errorResponder;