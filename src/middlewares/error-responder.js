const errorResponder = (err, req, res, next) => {
  const error = {
    success: false,
    body: {
      code: err.code || 500,
      message: err.message || null,
      details: err.details || null,
    },
  };
  res
    .status(typeof err.code !== "number" || isNaN(err.code) ? 500 : err.code)
    .json(error);
};

module.exports = errorResponder;
