import { Controller, Get, HttpException, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Public } from '../auth/public.decorator';
import { assertPublicRateLimit, PersonnelRuleError } from '../personnel/personnel-rules';
import { ListCoursesQueryDto } from './dto/learning.dto';
import { LearningService } from './learning.service';

function sourceIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function limit(req: Request): void {
  try {
    assertPublicRateLimit(`catalog:${sourceIp(req)}`, Date.now());
  } catch (error) {
    if (error instanceof PersonnelRuleError && error.code === 'RATE_LIMIT') {
      throw new HttpException({ message: 'RATE_LIMIT' }, 429);
    }
    throw error;
  }
}

/**
 * Anonymous catalogue of published programmes on the server organization allowlist.
 * Personal rows are not queried, and the caller cannot name an organization.
 */
@Public()
@Controller('public/catalog')
export class PublicCatalogController {
  constructor(private readonly learning: LearningService) {}

  @Get('courses')
  list(@Query() query: ListCoursesQueryDto, @Req() req: Request) {
    limit(req);
    return this.learning.listPublicCatalog(query.areaCode);
  }

  @Get('courses/:courseId')
  one(@Param('courseId', ParseUUIDPipe) courseId: string, @Req() req: Request) {
    limit(req);
    return this.learning.getPublicCatalogCourse(courseId);
  }
}
