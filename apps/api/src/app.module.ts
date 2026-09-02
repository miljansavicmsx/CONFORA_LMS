import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CertificationApplicationsModule } from './certification-applications/certification-applications.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MfaAssuranceGuard } from './auth/mfa-assurance.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ActiveAssuranceGuard } from './tenant/active-assurance.guard';
import { AssuranceExceptionFilter } from './tenant/assurance-exception.filter';
import { ClientTenantRejectionMiddleware } from './tenant/client-tenant-rejection.middleware';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    PrismaModule,
    AuthModule,
    TenantModule,
    AuditModule,
    CertificationApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActiveAssuranceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MfaAssuranceGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AssuranceExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClientTenantRejectionMiddleware).forRoutes('*');
  }
}
