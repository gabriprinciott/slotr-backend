import "reflect-metadata";
import { plainToInstance, Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export enum LogLevel {
  Fatal = "fatal",
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
  Silent = "silent",
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment, {
    message: "NODE_ENV must be one of: development, production, test",
  })
  NODE_ENV: Environment = Environment.Development;

  @IsOptional()
  @IsNumber({}, { message: "PORT must be a valid number" })
  PORT: number = 3000;

  @IsNotEmpty({ message: "POSTGRES_USER is required" })
  @IsString()
  POSTGRES_USER: string;

  @IsNotEmpty({ message: "POSTGRES_PASSWORD is required" })
  @IsString()
  POSTGRES_PASSWORD: string;

  @IsNotEmpty({ message: "POSTGRES_DB is required" })
  @IsString()
  POSTGRES_DB: string;

  @IsOptional()
  @IsString()
  POSTGRES_HOST: string = "localhost";

  @IsNotEmpty({ message: "POSTGRES_PORT is required" })
  @IsNumber({}, { message: "POSTGRES_PORT must be a valid number" })
  POSTGRES_PORT: number;

  @IsOptional()
  @IsString({ message: "REDIS_HOST must be a valid host string" })
  REDIS_HOST: string = "localhost";

  @IsOptional()
  @IsNumber({}, { message: "REDIS_PORT must be a valid number" })
  REDIS_PORT: number = 6380;

  @IsOptional()
  @IsEnum(LogLevel, {
    message:
      "LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace, silent",
  })
  LOG_LEVEL?: LogLevel;

  @IsOptional()
  @IsString({ message: "LOG_DIR must be a valid directory path string" })
  LOG_DIR: string = "logs";

  @IsOptional()
  @IsString({ message: "LOG_FILE_NAME must be a valid file name string" })
  LOG_FILE_NAME: string = "slotr";

  @IsOptional()
  @Transform(({ obj }) => {
    const rawValue = obj?.SWAGGER_ENABLED;
    if (rawValue === undefined || rawValue === null || rawValue === "")
      return true;
    if (typeof rawValue === "boolean") return rawValue;
    if (rawValue === "false" || rawValue === "0") return false;
    if (rawValue === "true" || rawValue === "1") return true;
    return rawValue;
  })
  @IsBoolean({ message: "SWAGGER_ENABLED must be a boolean" })
  SWAGGER_ENABLED: boolean = true;

  @IsOptional()
  @IsString({ message: "SWAGGER_PATH must be a valid path string" })
  SWAGGER_PATH: string = "api/docs";

  @IsOptional()
  @IsString({ message: "SWAGGER_TITLE must be a valid title string" })
  SWAGGER_TITLE: string = "Slotr API";

  @IsOptional()
  @IsString({
    message: "SWAGGER_DESCRIPTION must be a valid description string",
  })
  SWAGGER_DESCRIPTION: string = "Slotr booking and scheduling REST API";

  @IsOptional()
  @IsString({ message: "SWAGGER_VERSION must be a valid version string" })
  SWAGGER_VERSION: string = "1.0";
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .flatMap((error) => Object.values(error.constraints || {}))
      .map((msg) => `  - ${msg}`)
      .join("\n");

    throw new Error(
      `\n[ConfigValidation] Configuration Error: Missing or invalid environment variables:\n${errorMessages}\n\nPlease configure the required variables in your .env file (see .env.example).\n`,
    );
  }

  return validatedConfig;
}
