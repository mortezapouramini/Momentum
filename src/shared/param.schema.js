const { object, string } = require("yup")

const uuidParamSchema = (paramName) => object({
  [paramName]: string()
    .uuid(`Invalid ${paramName}`)
    .required(`${paramName} is required`),
})

module.exports = { uuidParamSchema }