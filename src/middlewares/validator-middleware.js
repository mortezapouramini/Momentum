const appError = require("../utils/error-util");

const validate = (schema, source) => async (req, res, next) => {
  try {
    let validated = await schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    req[source] = validated;
    next();
  } catch (error) {
    next(appError(400, error.errors[0]));
  }
};

module.exports = { validate };