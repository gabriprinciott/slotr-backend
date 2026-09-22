export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6380", 10),
  },
  logging: {
    level: process.env.LOG_LEVEL,
    dir: process.env.LOG_DIR || "logs",
    fileName: process.env.LOG_FILE_NAME || "slotr",
  },
  swagger: {
    enabled:
      process.env.SWAGGER_ENABLED !== "false" &&
      process.env.SWAGGER_ENABLED !== "0",
    path: process.env.SWAGGER_PATH || "api/docs",
    title: process.env.SWAGGER_TITLE || "Slotr API",
    description:
      process.env.SWAGGER_DESCRIPTION ||
      "Slotr booking and scheduling REST API",
    version: process.env.SWAGGER_VERSION || "1.0",
  },
});
