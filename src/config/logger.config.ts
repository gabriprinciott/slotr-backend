import { ConfigService } from "@nestjs/config";
import { Params } from "nestjs-pino";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Resolves the Pino log level based on environment variables.
 * If LOG_LEVEL is explicitly provided, it takes precedence.
 * Otherwise, defaults to 'info' in production and 'debug' in development/test.
 */
export function getLogLevel(configService: ConfigService): string {
  const customLevel = configService.get<string>("LOG_LEVEL");
  if (customLevel) {
    return customLevel;
  }
  const nodeEnv = configService.get<string>("NODE_ENV") || "development";
  return nodeEnv === "production" ? "info" : "debug";
}

/**
 * Builds the PinoLogger / nestjs-pino configuration params.
 * Configures dual targets:
 *  1. Console / stdout (pino-pretty for development, structured JSON for production)
 *  2. File in logs/ directory using pino-roll with daily rotation and 7-day retention (1 week)
 */
export function getLoggerConfig(configService: ConfigService): Params {
  const nodeEnv = configService.get<string>("NODE_ENV") || "development";
  const isProd = nodeEnv === "production";
  const logLevel = getLogLevel(configService);
  const logDir = configService.get<string>("LOG_DIR") || "logs";

  const consoleTarget = isProd
    ? {
        target: "pino/file",
        level: logLevel,
        options: { destination: 1 },
      }
    : {
        target: "pino-pretty",
        level: logLevel,
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
        },
      };

  const logFileName = configService.get<string>("LOG_FILE_NAME") || "slotr";

  const fileTarget = {
    target: "pino-roll",
    level: logLevel,
    options: {
      file: path.join(process.cwd(), logDir, logFileName),
      frequency: "daily",
      limit: { count: 7 }, 
      mkdir: true,
    },
  };

  return {
    pinoHttp: {
      level: logLevel,
      genReqId: (req: any) =>
        req?.headers?.["x-request-id"] || req?.id || crypto.randomUUID(),
      transport: {
        targets: [consoleTarget, fileTarget],
      },
      autoLogging: true,
    },
  };
}
