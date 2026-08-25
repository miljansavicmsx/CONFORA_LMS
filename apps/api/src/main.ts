import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';

function resolvePort(value: string | undefined): number {
  if (value === undefined) {
    return 4000;
  }

  if (!/^[0-9]+$/.test(value)) {
    throw new Error('API_PORT must be a base-10 integer between 1 and 65535.');
  }

  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error('API_PORT must be a base-10 integer between 1 and 65535.');
  }

  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableShutdownHooks();
  await app.listen(resolvePort(process.env['API_PORT']));
}

void bootstrap();
