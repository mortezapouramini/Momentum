class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

const appError = (code, message, details = null) => {
  return new AppError(code, message, details);
};

module.exports = appError;
