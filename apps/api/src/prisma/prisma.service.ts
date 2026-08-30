import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@confora/database';

/**
 * Minimal BAR-P03 PrismaService.
 * Nest injectable adapter + lifecycle connect/disconnect only.
 * Tenant extension, repositories, audit, and business logic are forbidden.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
