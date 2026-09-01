import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';

import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { RequireLearnerRoles } from '../auth/require-learner-roles.decorator';
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { CertificationApplicationsService } from './certification-applications.service';
import type { CertificationApplicationListResponseDto } from './dto/certification-application-list-response.dto';
import type { CertificationApplicationResponseDto } from './dto/certification-application-response.dto';
import { ListCertificationApplicationsQueryDto } from './dto/list-certification-applications-query.dto';

function requiredActor(req: RequestWithPrincipal): AuthenticatedActor {
  const actor = getRequestPrincipal(req);
  if (!actor) {
    throw new AccessDeniedError();
  }
  return actor;
}

@Controller('me/certification/applications')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
export class CertificationApplicationsController {
  constructor(private readonly service: CertificationApplicationsService) {}

  @Get()
  list(
    @Query() query: ListCertificationApplicationsQueryDto,
    @Req() req: RequestWithPrincipal,
  ): Promise<CertificationApplicationListResponseDto> {
    return this.service.listApplications(requiredActor(req), {
      limit: query.limit,
      offset: query.offset,
      ...(query.status !== undefined ? { status: query.status } : {}),
    });
  }

  @Get(':id')
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithPrincipal,
  ): Promise<CertificationApplicationResponseDto> {
    return this.service.getApplicationById(requiredActor(req), id);
  }
}
