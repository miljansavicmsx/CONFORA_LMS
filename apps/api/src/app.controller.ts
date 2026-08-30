import { Controller, Get } from '@nestjs/common';

import { Public } from './auth/public.decorator';

@Public()
@Controller('health')
export class AppController {
  @Get()
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
