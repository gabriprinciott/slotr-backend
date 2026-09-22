import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger as PinoLogger } from "nestjs-pino";
import { AllExceptionsFilter } from "./common/exceptions/all-exceptions.filter";
import { setupSwagger } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'https://slotr.gabrieleprinciotta.it';

  app.enableCors({
    origin: frontendUrl.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  
  app.useGlobalFilters(new AllExceptionsFilter());

  
  setupSwagger(app, configService);

  const port = configService.get<number>("PORT") || 3000;

  await app.listen(port, '0.0.0.0');
  const logger = new Logger("Bootstrap");
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
