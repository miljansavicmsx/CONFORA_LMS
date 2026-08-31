import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { MfaAssuranceGuard } from './mfa-assurance.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PrismaModule],
  providers: [JwtStrategy, MfaAssuranceGuard],
  exports: [PassportModule, MfaAssuranceGuard],
})
export class AuthModule {}
