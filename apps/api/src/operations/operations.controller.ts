import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';

import { AnnualFeeService } from '../annual-fee/annual-fee.service';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { RequireLearnerRoles } from '../auth/require-learner-roles.decorator';
import { RequireMfa } from '../auth/require-mfa.decorator';
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from '../exam/exam-roles.guard';
import { NoticeService } from '../notices/notice.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { NonPaymentDto, RecertificationFeeDto, SchemeFeeDto } from './operations.dto';

function actor(req: RequestWithPrincipal): AuthenticatedActor {
  const principal = getRequestPrincipal(req);
  if (!principal) {
    throw new AccessDeniedError();
  }
  return principal;
}

@Controller('staff/schemes/:schemeVersionId')
@UseGuards(ExamStaffRolesGuard)
export class SchemeAnnualFeeController {
  constructor(private readonly fees: AnnualFeeService) {}

  @Post('annual-fee')
  save(
    @Param('schemeVersionId', ParseUUIDPipe) schemeVersionId: string,
    @Body() body: SchemeFeeDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.fees.save(actor(req), schemeVersionId, body);
  }

  @Get('annual-fee')
  read(
    @Param('schemeVersionId', ParseUUIDPipe) schemeVersionId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.fees.read(actor(req), schemeVersionId);
  }
}

@Controller('me/notices')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class LearnerNoticeController {
  constructor(private readonly notices: NoticeService) {}

  @Get()
  list(@Req() req: RequestWithPrincipal) {
    return this.notices.list(actor(req));
  }

  @Post(':noticeId/read')
  read(@Param('noticeId', ParseUUIDPipe) noticeId: string, @Req() req: RequestWithPrincipal) {
    return this.notices.read(actor(req), noticeId);
  }
}

@Controller('staff/notices')
@UseGuards(ExamStaffRolesGuard)
export class StaffNoticeController {
  constructor(private readonly notices: NoticeService) {}

  @Post('reminders')
  remind(@Req() req: RequestWithPrincipal) {
    return this.notices.remind(actor(req));
  }

  @Post(':jobId/bounce')
  bounce(@Param('jobId', ParseUUIDPipe) jobId: string, @Req() req: RequestWithPrincipal) {
    return this.notices.bounce(actor(req), jobId);
  }

  @Post(':jobId/complaint')
  complaint(@Param('jobId', ParseUUIDPipe) jobId: string, @Req() req: RequestWithPrincipal) {
    return this.notices.complaint(actor(req), jobId);
  }
}

@Controller('me/annual-fees')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class LearnerAnnualFeeController {
  constructor(private readonly fees: AnnualFeeService) {}

  @Get()
  list(@Req() req: RequestWithPrincipal) {
    return this.fees.listMine(actor(req));
  }
}

@Controller('committee/annual-fees')
@UseGuards(ExamCommitteeRolesGuard)
export class CommitteeAnnualFeeController {
  constructor(private readonly fees: AnnualFeeService) {}

  @Post('non-payment')
  nonPayment(@Body() body: NonPaymentDto, @Req() req: RequestWithPrincipal) {
    return this.fees.openCase(actor(req), body);
  }

  @Post('recertification')
  recertification(@Body() body: RecertificationFeeDto, @Req() req: RequestWithPrincipal) {
    return this.fees.chargeRecertification(actor(req), body);
  }
}
