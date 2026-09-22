import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { RedisService } from "./redis.service";

@Module({
  providers: [EventsGateway, RedisService],
  exports: [EventsGateway],
})
export class EventsModule {}
