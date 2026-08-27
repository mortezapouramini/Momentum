const { object, string, number } = require("yup");

const envSchema = object({
  NODE_ENV: string()
    .oneOf(["development", "production", "test"])
    .required("NODE_ENV is required"),

  SERVER_PORT: number().required("SERVER_PORT is required"),

  DATABASE: string().required("DATABASE is required"),
  DB_USER: string().required("DB_USER is required"),
  DB_PASSWORD: string().required("DB_PASSWORD is required"),
  DB_HOST: string().required("DB_HOST is required"),
  DB_PORT: number().required("DB_PORT is required"),

  REDIS_HOST: string().required("REDIS_HOST is required"),
  REDIS_PORT: number().required("REDIS_PORT is required"),

  JWT_ALGORITHM: string().required("JWT_ALGORITHM is required"),
  ACCESS_PRIVATE_KEY_BASE64: string().required(
    "ACCESS_PRIVATE_KEY_BASE64 is required",
  ),
  ACCESS_PUBLIC_KEY_BASE64: string().required(
    "ACCESS_PUBLIC_KEY_BASE64 is required",
  ),
  REFRESH_TOKEN_HASH_SECRET: string().required(
    "REFRESH_TOKEN_HASH_SECRET is required",
  ),

  SMTP_HOST: string().required("SMTP_HOST is required"),
  SMTP_PORT: number().required("SMTP_PORT is required"),
  SMTP_USER: string().required("SMTP_USER is required"),
  SMTP_PASS: string().required("SMTP_PASS is required"),

  CORS_ORIGIN: string().required(
    "CORS_ORIGIN is required (comma-separated list of allowed origins)",
  ),
});

const validateEnv = () => {
  try {
    envSchema.validateSync(process.env, { abortEarly: false });
  } catch (error) {
    const message = [
      "Invalid or missing environment variables:",
      ...error.errors.map((e) => `  - ${e}`),
    ].join("\n");
    console.error(message);
    process.exit(1);
  }
};

module.exports = validateEnv;
