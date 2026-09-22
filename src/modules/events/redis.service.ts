import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get<string>("redis.host") || "localhost",
      port: this.configService.get<number>("redis.port") || 6380,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy(times) {
        return Math.min(times * 200, 3000);
      },
    });

    this.redisClient.on("error", (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });

    this.redisClient.on("connect", () => {
      this.logger.log("Successfully connected to Redis");
    });

    this.redisClient.on("reconnecting", () => {
      this.logger.warn("Reconnecting to Redis...");
    });
  }

  onModuleDestroy() {
    try {
      this.redisClient?.disconnect();
    } catch (error) {
      this.logger.error(`Error disconnecting Redis: ${error.message}`);
    }
  }

  
  async setLock(
    date: string,
    timeSlot: string,
    clientId: string,
    ttlSeconds = 60,
  ): Promise<boolean> {
    if (!this.redisClient) {
      this.logger.warn("Redis client is not initialized");
      return false;
    }

    try {
      const key = `lock:${date}:${timeSlot}`;
      const result = await this.redisClient.set(
        key,
        clientId,
        "EX",
        ttlSeconds,
        "NX",
      );
      return result === "OK";
    } catch (error) {
      this.logger.error(
        `Failed to set lock for ${date} ${timeSlot}: ${error.message}`,
      );
      return false;
    }
  }

  async releaseLock(
    date: string,
    timeSlot: string,
    clientId: string,
  ): Promise<boolean> {
    if (!this.redisClient) {
      this.logger.warn("Redis client is not initialized");
      return false;
    }

    try {
      const key = `lock:${date}:${timeSlot}`;
      const currentLock = await this.redisClient.get(key);

      if (currentLock === clientId) {
        await this.redisClient.del(key);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to release lock for ${date} ${timeSlot}: ${error.message}`,
      );
      return false;
    }
  }

  async getLockedSlots(date: string): Promise<string[]> {
    if (!this.redisClient) {
      this.logger.warn("Redis client is not initialized");
      return [];
    }

    try {
      const keys = await this.redisClient.keys(`lock:${date}:*`);
      return keys.map((key) => key.split(":")[2]);
    } catch (error) {
      this.logger.error(
        `Failed to get locked slots for ${date}: ${error.message}`,
      );
      return [];
    }
  }
}
