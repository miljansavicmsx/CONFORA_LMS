import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { RequireLearnerRoles } from '../auth/require-learner-roles.decorator';
import { RequireMfa } from '../auth/require-mfa.decorator';
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  BlueprintDomainsDto,
  CreateBlueprintDto,
  CreateItemDto,
  ListItemsQueryDto,
  OpenStandardSettingDto,
  ProctorFlagDto,
  ProctorReviewDto,
  RecordDecisionDto,
  SaveAnswersDto,
  ScheduleSessionDto,
  StandardSettingRatingsDto,
  StartSessionDto,
  TransitionItemDto,
  UpdateDraftDto,
} from './dto/exam.dto';
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from './exam-roles.guard';
import { ExamService } from './exam.service';

function actor(req: RequestWithPrincipal): AuthenticatedActor {
  const principal = getRequestPrincipal(req);
  if (!principal) {
    throw new AccessDeniedError();
  }
  return principal;
}

@Controller('staff/exams')
@UseGuards(ExamStaffRolesGuard)
export class StaffExamController {
  constructor(private readonly exams: ExamService) {}

  @Post('items')
  createItem(@Body() body: CreateItemDto, @Req() req: RequestWithPrincipal) {
    return this.exams.createItem(actor(req), body);
  }

  @Get('items')
  listItems(@Query() query: ListItemsQueryDto, @Req() req: RequestWithPrincipal) {
    return this.exams.listItems(actor(req), query.schemeId);
  }

  @Post('items/:itemId/draft')
  updateDraft(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() body: UpdateDraftDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.updateDraft(actor(req), itemId, body);
  }

  @Post('items/:itemId/versions')
  createVersion(@Param('itemId', ParseUUIDPipe) itemId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.createVersion(actor(req), itemId);
  }

  @Post('items/:itemId/transitions')
  transition(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() body: TransitionItemDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.transition(actor(req), itemId, {
      toStatus: body.toStatus,
      ...(body.note !== undefined ? { note: body.note } : {}),
    });
  }

  @Get('blueprints')
  listBlueprints(@Req() req: RequestWithPrincipal) {
    return this.exams.listBlueprints(actor(req));
  }

  @Post('blueprints')
  createBlueprint(@Body() body: CreateBlueprintDto, @Req() req: RequestWithPrincipal) {
    return this.exams.createBlueprint(actor(req), body);
  }

  @Post('blueprints/:blueprintId/domains')
  domains(
    @Param('blueprintId', ParseUUIDPipe) blueprintId: string,
    @Body() body: BlueprintDomainsDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.setDomains(actor(req), blueprintId, body.domains);
  }

  @Post('blueprints/:blueprintId/standard-setting')
  standardSetting(
    @Param('blueprintId', ParseUUIDPipe) blueprintId: string,
    @Body() body: OpenStandardSettingDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.openStandardSetting(actor(req), blueprintId, body.note);
  }

  @Post('standard-settings/:recordId/ratings')
  ratings(
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() body: StandardSettingRatingsDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.addRatings(actor(req), recordId, body.ratings);
  }

  @Post('standard-settings/:recordId/approve')
  approveCut(@Param('recordId', ParseUUIDPipe) recordId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.approveCutScore(actor(req), recordId);
  }

  @Post('blueprints/:blueprintId/approve')
  approveBlueprint(
    @Param('blueprintId', ParseUUIDPipe) blueprintId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.approveBlueprint(actor(req), blueprintId);
  }

  @Post('blueprints/:blueprintId/assemble')
  assemble(
    @Param('blueprintId', ParseUUIDPipe) blueprintId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.assemble(actor(req), blueprintId);
  }

  @Get('forms/:formId/psychometrics')
  psychometrics(@Param('formId', ParseUUIDPipe) formId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.psychometrics(actor(req), formId);
  }

  @Post('sessions')
  schedule(@Body() body: ScheduleSessionDto, @Req() req: RequestWithPrincipal) {
    return this.exams.schedule(actor(req), body);
  }

  @Post('sessions/:sessionId/proctor-flags')
  flag(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() body: ProctorFlagDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.addFlag(actor(req), sessionId, body);
  }

  @Post('proctor-flags/:flagId/reviews')
  reviewFlag(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Body() body: ProctorReviewDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.reviewFlag(actor(req), flagId, {
      disposition: body.disposition,
      ...(body.note !== undefined ? { note: body.note } : {}),
    });
  }
}

@Controller('me/exams')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
@RequireMfa()
export class CandidateExamController {
  constructor(private readonly exams: ExamService) {}

  @Get('sessions')
  list(@Req() req: RequestWithPrincipal) {
    return this.exams.listMine(actor(req));
  }

  @Post('sessions/:sessionId/start')
  start(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() body: StartSessionDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.start(actor(req), sessionId, body);
  }

  @Get('sessions/:sessionId')
  get(@Param('sessionId', ParseUUIDPipe) sessionId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.getSession(actor(req), sessionId);
  }

  @Put('sessions/:sessionId/answers')
  save(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() body: SaveAnswersDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.exams.saveAnswers(actor(req), sessionId, body.answers);
  }

  @Post('sessions/:sessionId/submit')
  submit(@Param('sessionId', ParseUUIDPipe) sessionId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.submit(actor(req), sessionId);
  }

  @Get('sessions/:sessionId/result')
  result(@Param('sessionId', ParseUUIDPipe) sessionId: string, @Req() req: RequestWithPrincipal) {
    return this.exams.result(actor(req), sessionId);
  }
}

@Controller('committee/exams')
@UseGuards(ExamCommitteeRolesGuard)
export class CommitteeExamController {
  constructor(private readonly exams: ExamService) {}

  @Get('queue')
  queue(@Req() req: RequestWithPrincipal) {
    return this.exams.queue(actor(req));
  }

  @Post('decisions')
  decide(@Body() body: RecordDecisionDto, @Req() req: RequestWithPrincipal) {
    return this.exams.decide(actor(req), body);
  }
}
