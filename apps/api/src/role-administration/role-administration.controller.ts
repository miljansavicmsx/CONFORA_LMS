import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Injectable,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ROLE_GRANT_AUTHORITY } from '@confora/shared-types';

import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { parseRoleAdministrationCommandDto } from './dto/role-administration-command.dto';
import {
  RoleAdministrationWorkflowService,
  type RoleAdministrationWorkflowResult,
} from './role-administration-workflow.service';

function denied(codes: readonly string[]): RoleAdministrationWorkflowResult {
  return Object.freeze({
    recorded: false,
    roleApplied: false,
    externalEffect: 'NONE',
    reviewObligationCreated: false,
    auditEvents: Object.freeze([]),
    codes: Object.freeze([...codes]),
  });
}

/**
 * Server principal only. Body fields cannot supply roles, user id, or tenant.
 */
@Injectable()
export class RoleAdministrationAuthorityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    assertServerActor(getRequestPrincipal(request));
    return true;
  }
}

export function assertServerActor(
  actor: AuthenticatedActor | undefined,
): asserts actor is AuthenticatedActor {
  if (actor == null || actor.userId.trim().length === 0 || actor.tenantId.trim().length === 0) {
    throw new UnauthorizedException(denied(['ACTOR_NOT_AUTHENTICATED']));
  }
  if (!actor.mfaVerified) {
    throw new ForbiddenException(denied(['MFA_ASSURANCE_REQUIRED']));
  }
  if (!actor.roles.includes(ROLE_GRANT_AUTHORITY)) {
    throw new ForbiddenException(denied(['ACTOR_AUTHORITY_ROLE_MISSING']));
  }
}

@Controller('role-administration')
@UseGuards(RoleAdministrationAuthorityGuard)
export class RoleAdministrationController {
  constructor(private readonly workflow: RoleAdministrationWorkflowService) {}

  @Post('commands')
  @HttpCode(200)
  async execute(
    @Req() request: RequestWithPrincipal,
    @Body() body: unknown,
  ): Promise<RoleAdministrationWorkflowResult> {
    const actor = getRequestPrincipal(request);
    assertServerActor(actor);
    const parsed = parseRoleAdministrationCommandDto(body, actor.tenantId);
    if (!parsed.ok) {
      throw new UnprocessableEntityException(denied(parsed.codes));
    }
    const result = await this.workflow.execute(actor, parsed.command);
    if (!result.recorded) {
      throw new UnprocessableEntityException(result);
    }
    return result;
  }
}
