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
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  AnalyticsConsentBodyDto,
  EnrolBodyDto,
  LessonProgressBodyDto,
  ListCoursesQueryDto,
  QuizAttemptBodyDto,
} from './dto/learning.dto';
import { LearningService } from './learning.service';

function requiredActor(req: RequestWithPrincipal): AuthenticatedActor {
  const actor = getRequestPrincipal(req);
  if (!actor) {
    throw new AccessDeniedError();
  }
  return actor;
}

@Controller('me/learning')
@UseGuards(LearnerRolesGuard)
@RequireLearnerRoles()
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('courses')
  listCourses(@Query() query: ListCoursesQueryDto) {
    return this.learning.listCourses(query.areaCode);
  }

  @Get('courses/:courseId')
  getCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.learning.getCourse(courseId);
  }

  @Post('enrolments')
  enrol(@Body() body: EnrolBodyDto, @Req() req: RequestWithPrincipal) {
    return this.learning.enrol(requiredActor(req), body.courseId);
  }

  @Get('enrolments')
  listEnrolments(@Req() req: RequestWithPrincipal) {
    return this.learning.listEnrolments(requiredActor(req));
  }

  @Get('enrolments/:enrolmentId/player')
  player(
    @Param('enrolmentId', ParseUUIDPipe) enrolmentId: string,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.learning.getPlayer(requiredActor(req), enrolmentId);
  }

  @Post('enrolments/:enrolmentId/lessons/:lessonId/progress')
  progress(
    @Param('enrolmentId', ParseUUIDPipe) enrolmentId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() body: LessonProgressBodyDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.learning.recordProgress(requiredActor(req), enrolmentId, lessonId, {
      additionalSeconds: body.additionalSeconds,
      statementId: body.statementId,
      ...(body.analyticsConsent !== undefined ? { analyticsConsent: body.analyticsConsent } : {}),
    });
  }

  @Post('enrolments/:enrolmentId/quizzes/:quizId/attempts')
  quiz(
    @Param('enrolmentId', ParseUUIDPipe) enrolmentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() body: QuizAttemptBodyDto,
    @Req() req: RequestWithPrincipal,
  ) {
    return this.learning.submitQuiz(requiredActor(req), enrolmentId, quizId, {
      statementId: body.statementId,
      answers: body.answers,
      ...(body.analyticsConsent !== undefined ? { analyticsConsent: body.analyticsConsent } : {}),
    });
  }

  @Get('statistics')
  statistics(@Req() req: RequestWithPrincipal) {
    return this.learning.statistics(requiredActor(req));
  }

  @Get('analytics-consent')
  getConsent(@Req() req: RequestWithPrincipal) {
    return this.learning.getConsent(requiredActor(req));
  }

  @Put('analytics-consent')
  setConsent(@Body() body: AnalyticsConsentBodyDto, @Req() req: RequestWithPrincipal) {
    return this.learning.setConsent(requiredActor(req), body.granted);
  }
}
