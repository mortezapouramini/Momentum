const responder = (res, data = null, details = null, code = 200, message = null) => {
  const response = {
    success: true,
    code,
    message,
    data,
    details,
  };
  res.status(code).json(response);
};

module.exports = responder;
