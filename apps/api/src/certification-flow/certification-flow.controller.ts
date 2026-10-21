import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from '../exam/exam-roles.guard';
import { assertPublicRateLimit } from '../personnel/personnel-rules';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { CertificationFlowService } from './certification-flow.service';
import {
  AssistDto,
  AuthorizeIssuanceDto,
  CaseRuleDto,
  ConfirmSlotDto,
  DecisionMakerDto,
  DossierDto,
  EvidenceDto,
  LevelDto,
  LinkExamDto,
  NameConsentDto,
  OpenCaseDto,
  ProposeDto,
  RefereeAssessmentDto,
  RefereeRequestDto,
  RefereeResponseDto,
  ConflictDeclarationDto,
  VoteDto,
} from './dto/flow.dto';

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

/** Process-local window. Distributed rate limiting remains a production gap. */
function limit(req: Request): void {
  assertPublicRateLimit(sourceIp(req), Date.now());
}

@Controller('staff/schemes/:schemeVersionId')
@UseGuards(ExamStaffRolesGuard)
export class SchemeCaseStaffController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Post('levels')
  levels(
    @Param('schemeVersionId', ParseUUIDPipe) schemeVersionId: string,
    @Body() body: LevelDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.saveLevel(actor(req), schemeVersionId, body);
  }

  @Post('decision-makers')
  makers(
    @Param('schemeVersionId', ParseUUIDPipe) schemeVersionId: string,
    @Body() body: DecisionMakerDto,
    @Req() req: RequestWithPrincipal,
  ) {
    if (body.kind) {
      return this.flow.grantSchemeAuthority(actor(req), schemeVersionId, {
        userId: body.userId,
        kind: body.kind,
        documentRef: body.documentRef ?? body.competenceNote,
        validFrom: body.authorisedFrom,
        validUntil: body.authorisedUntil,
      });
    }
    return this.flow.saveDecisionMaker(actor(req), schemeVersionId, body);
  }

  @Post('case-rules')
  rules(
    @Param('schemeVersionId', ParseUUIDPipe) schemeVersionId: string,
    @Body() body: CaseRuleDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.saveCaseRule(actor(req), schemeVersionId, body);
  }
}

@Controller('me/certification-cases')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class LearnerCaseController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Post()
  open(@Body() body: OpenCaseDto, @Req() req: RequestWithPrincipal) {
    return this.flow.open(actor(req), body);
  }

  @Get()
  list(@Req() req: RequestWithPrincipal) {
    return this.flow.listMine(actor(req));
  }

  @Get(':caseId')
  one(@Param('caseId', ParseUUIDPipe) caseId: string, @Req() req: RequestWithPrincipal) {
    return this.flow.mineOne(actor(req), caseId);
  }

  @Post(':caseId/dossier')
  dossier(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: DossierDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.completeDossier(actor(req), caseId, body.experienceMonths);
  }

  @Post(':caseId/evidence')
  evidence(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: EvidenceDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.addEvidence(actor(req), caseId, {
      kind: body.kind,
      title: body.title,
      ...(body.summary !== undefined ? { summary: body.summary } : {}),
      ...(body.objectKey !== undefined ? { objectKey: body.objectKey } : {}),
    });
  }

  @Post(':caseId/referees')
  referees(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: RefereeRequestDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.requestReferee(actor(req), caseId, body);
  }

  @Post(':caseId/link-exam')
  link(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: LinkExamDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.linkExam(actor(req), caseId, body.resultId);
  }
}

@Controller('me/documents')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class LearnerDocumentController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Get('education')
  education(@Req() req: RequestWithPrincipal) {
    return this.flow.education(actor(req));
  }

  @Get('exam-passes')
  examPasses(@Req() req: RequestWithPrincipal) {
    return this.flow.examPasses(actor(req));
  }

  @Put(':verificationId/name-consent')
  nameConsent(
    @Param('verificationId') verificationId: string,
    @Body() body: NameConsentDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.setNameConsent(actor(req), verificationId, body.granted);
  }
}

@Controller('committee/cases')
@UseGuards(ExamCommitteeRolesGuard)
export class CommitteeCaseController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Get()
  list(@Req() req: RequestWithPrincipal) {
    return this.flow.listCommittee(actor(req));
  }

  @Get(':caseId')
  one(@Param('caseId', ParseUUIDPipe) caseId: string, @Req() req: RequestWithPrincipal) {
    return this.flow.committeeOne(actor(req), caseId);
  }

  @Post(':caseId/propose')
  propose(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: ProposeDto,
    @Req() req: RequestWithPrincipal,
  ) {
    if (
      body.requestId &&
      body.grounds &&
      body.recordedCoiReview &&
      body.competenceReview &&
      body.priorVoteImpact
    ) {
      return this.flow.approveComposition(actor(req), caseId, {
        requestId: body.requestId,
        grounds: body.grounds,
        recordedCoiReview: body.recordedCoiReview,
        competenceReview: body.competenceReview,
        priorVoteImpact: body.priorVoteImpact,
        ...(body.requestedSide ? { requestedSide: body.requestedSide } : {}),
      });
    }
    if (body.reviewAction === 'OPEN' && body.statement) {
      return this.flow.openIssuedReview(actor(req), caseId, body.statement);
    }
    if (body.reviewAction === 'DECIDE' && body.reviewId && body.outcome && body.rationale) {
      return this.flow.decideIssuedReview(actor(req), caseId, body.reviewId, {
        outcome: body.outcome,
        rationale: body.rationale,
      });
    }
    return this.flow.propose(actor(req), caseId, body.reason ?? '', body.requestedSide);
  }

  @Post(':caseId/confirm')
  confirm(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: ConfirmSlotDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.confirm(actor(req), caseId, body.memberUserId);
  }

  @Post(':caseId/votes')
  votes(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: VoteDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.vote(actor(req), caseId, body);
  }

  @Post(':caseId/evidence-assessment')
  assess(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: RefereeAssessmentDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.assessReferee(actor(req), caseId, body);
  }

  @Post(':caseId/assist')
  assist(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: AssistDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.assist(actor(req), caseId, body.purpose);
  }

  @Post(':caseId/issue-authorization')
  authorize(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: AuthorizeIssuanceDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.authorize(actor(req), caseId, body);
  }

  @Post(':caseId/conflict-declaration')
  conflict(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: ConflictDeclarationDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.declareConflict(actor(req), caseId, body);
  }
}

@Controller('committee/exam-passes')
@UseGuards(ExamCommitteeRolesGuard)
export class CommitteeExamPassController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Post(':attestationId/release')
  release(
    @Param('attestationId', ParseUUIDPipe) attestationId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.flow.releaseExamPass(actor(req), attestationId);
  }
}

@Public()
@Controller('public/documents')
export class PublicDocumentController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Get(':verificationId/pdf')
  async pdf(@Param('verificationId') verificationId: string, @Req() req: Request) {
    limit(req);
    const file = await this.flow.publicPdf(verificationId, sourceIp(req));
    return new StreamableFile(Buffer.from(file.bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Get(':verificationId')
  one(@Param('verificationId') verificationId: string, @Req() req: Request) {
    limit(req);
    return this.flow.publicDocument(verificationId, sourceIp(req));
  }
}

@Public()
@Controller('public/referees')
export class PublicRefereeController {
  constructor(private readonly flow: CertificationFlowService) {}

  @Post(':token')
  respond(@Param('token') token: string, @Body() body: RefereeResponseDto, @Req() req: Request) {
    limit(req);
    return this.flow.confirmReferee(token, {
      accept: body.accept,
      ...(body.confirmedFacts !== undefined ? { confirmedFacts: body.confirmedFacts } : {}),
      ...(body.discrepancies !== undefined ? { discrepancies: body.discrepancies } : {}),
    });
  }
}
