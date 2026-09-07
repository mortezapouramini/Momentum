const appError = require("../utils/error.util");

const validate = (schema, source) => async (req, res, next) => {
  try {
    let validated = await schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (source === "query") {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, validated);
    } else {
      req[source] = { ...req[source], ...validated };
    }
    next();
  } catch (error) {
    next(appError({ code: 400, message: error.errors[0] }));
  }
};

module.exports = { validate };
