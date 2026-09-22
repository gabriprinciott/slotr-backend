import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const url = configService.get<string>("database.url");
    if (!url) {
      throw new Error(
        'Database configuration error: Failed to construct database URL from POSTGRES environment variables.',
      );
    }
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
