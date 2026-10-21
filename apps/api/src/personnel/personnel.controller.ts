import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { Public } from '../auth/public.decorator';
import { RequireLearnerRoles } from '../auth/require-learner-roles.decorator';
import { RequireMfa } from '../auth/require-mfa.decorator';
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { ExamCommitteeRolesGuard } from '../exam/exam-roles.guard';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  AmfProposalDto,
  ChangeCertificateStatusDto,
  CpdRecordDto,
  IssueCertificateDto,
  PublicSearchDto,
} from './dto/personnel.dto';
import { assertPublicRateLimit } from './personnel-rules';
import { PersonnelCertificateService } from './personnel.service';

function actor(req: RequestWithPrincipal): AuthenticatedActor {
  const principal = getRequestPrincipal(req);
  if (!principal) {
    throw new AccessDeniedError();
  }
  return principal;
}

function sourceIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function limit(req: Request): void {
  assertPublicRateLimit(sourceIp(req), Date.now());
}

@Controller('committee/certificates')
@UseGuards(ExamCommitteeRolesGuard)
export class CommitteeCertificateController {
  constructor(private readonly personnel: PersonnelCertificateService) {}

  @Post()
  issue(@Body() body: IssueCertificateDto, @Req() req: RequestWithPrincipal) {
    return this.personnel.issue(actor(req), body);
  }

  @Post(':credentialId/status')
  status(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Body() body: ChangeCertificateStatusDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.changeStatus(actor(req), credentialId, body);
  }

  @Post(':credentialId/amf-proposals')
  amf(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Body() body: AmfProposalDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.proposeAmf(actor(req), credentialId, body.reason);
  }
}

@Controller('me/certificates')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class CandidateCertificateController {
  constructor(private readonly personnel: PersonnelCertificateService) {}

  @Get()
  list(@Req() req: RequestWithPrincipal) {
    return this.personnel.listMine(actor(req));
  }

  @Get(':credentialId/pdf-url')
  pdfUrl(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.pdfUrl(actor(req), credentialId);
  }

  @Get(':credentialId/pdf')
  async pdf(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    const file = await this.personnel.pdf(actor(req), credentialId);
    return new StreamableFile(Buffer.from(file.bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Get(':credentialId/credential')
  credential(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.credential(actor(req), credentialId);
  }

  @Post(':credentialId/cpd')
  cpd(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Body() body: CpdRecordDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.addCpd(actor(req), credentialId, body);
  }

  @Get(':credentialId/reminders')
  reminders(
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.personnel.reminders(actor(req), credentialId);
  }
}

@Controller('public/certificates')
export class PublicCertificateController {
  constructor(private readonly personnel: PersonnelCertificateService) {}

  @Public()
  @Get('status-list')
  statusList(@Req() req: Request) {
    limit(req);
    return this.personnel.statusList();
  }

  @Get()
  search(@Query() query: PublicSearchDto, @Req() req: Request) {
    limit(req);
    const number = query.number;
    const name = query.name;
    return this.personnel.search({
      ...(number !== undefined ? { number } : {}),
      ...(name !== undefined ? { name } : {}),
    });
  }

  @Public()
  @Get(':publicUid/pdf')
  async pdf(
    @Param('publicUid') publicUid: string,
    @Query('ticket') ticket: string | undefined,
    @Req() req: Request,
  ) {
    limit(req);
    const file = await this.personnel.publicPdf(publicUid, ticket ?? '');
    return new StreamableFile(Buffer.from(file.bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Public()
  @Get(':publicUid')
  one(@Param('publicUid') publicUid: string, @Req() req: Request) {
    limit(req);
    return this.personnel.publicOne(publicUid, sourceIp(req));
  }
}
