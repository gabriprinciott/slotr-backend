import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

export interface SwaggerConfigOptions {
  enabled: boolean;
  path: string;
  title: string;
  description: string;
  version: string;
}

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): OpenAPIObject | null {
  const isEnabled = configService.get<boolean>("swagger.enabled") ?? true;

  if (!isEnabled) {
    return null;
  }

  const path = configService.get<string>("swagger.path") || "api/docs";
  const title = configService.get<string>("swagger.title") || "Slotr API";
  const description =
    configService.get<string>("swagger.description") ||
    "Slotr booking and scheduling REST API";
  const version = configService.get<string>("swagger.version") || "1.0";

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addTag(
      "Bookings",
      "Endpoints for managing booking reservations and availability",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: `${title} Documentation`,
  });

  const logger = new Logger("Swagger");
  logger.log(
    `Swagger documentation configured at path: /${path.replace(/^\/+/, "")}`,
  );

  return document;
}
