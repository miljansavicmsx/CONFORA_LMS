import { Controller, Get, Req } from '@nestjs/common';

import { RequireMfa } from '../../src/auth/require-mfa.decorator';
import type { AuthenticatedActor } from '../../src/auth/request-principal';

/**
 * Test-only controllers. Never imported by production AppModule.
 */
@Controller('p04-synthetic')
export class BarP04SyntheticProbeController {
  @Get('probe')
  probe(): { ok: true } {
    return { ok: true };
  }
}

@Controller('p04-synthetic-mfa')
@RequireMfa()
export class BarP04SyntheticRequireMfaController {
  @Get('probe')
  probe(): { ok: true } {
    return { ok: true };
  }
}

@Controller('p04-synthetic-actor')
export class BarP04SyntheticActorController {
  @Get('me')
  me(@Req() req: { user?: AuthenticatedActor }): AuthenticatedActor | undefined {
    return req.user;
  }
}
