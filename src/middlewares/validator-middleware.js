const appError = require("../utils/error-util")


const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body, { 
      abortEarly: false, 
      stripUnknown: true 
    })
    next()
  } catch (error) {
    next(appError(400, error.errors[0]))
  }
}

module.exports = { validate }