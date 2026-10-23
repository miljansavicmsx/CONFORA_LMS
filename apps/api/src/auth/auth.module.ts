import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { MfaAssuranceGuard } from './mfa-assurance.guard';
import { OidcController } from './oidc.controller';
import { CanonicalUserResolver } from './resolve-db-user';
import { OidcSessionMiddleware } from './oidc-session.middleware';
import { OidcSessionStore } from './oidc-session-store';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PrismaModule],
  controllers: [OidcController],
  providers: [
    JwtStrategy,
    MfaAssuranceGuard,
    CanonicalUserResolver,
    OidcSessionStore,
    OidcSessionMiddleware,
  ],
  exports: [PassportModule, MfaAssuranceGuard, OidcSessionStore, OidcSessionMiddleware],
})
export class AuthModule {}
