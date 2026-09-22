import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { DatabaseModule } from "./modules/database/database.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { EventsModule } from "./modules/events/events.module";
import configuration from "./config/configuration";
import { validate } from "./config/env.validation";
import { getLoggerConfig } from "./config/logger.config";

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: [".env"],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getLoggerConfig(configService),
    }),
    DatabaseModule,
    BookingsModule,
    EventsModule,
  ],
})
export class AppModule {}
