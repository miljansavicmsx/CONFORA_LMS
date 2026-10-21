import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppController } from '../../src/app.controller';

function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

function isHealthOk(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false;
  }
  return value.status === 'ok';
}

describe('public health contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/health is public and returns ok', async () => {
    const response = await request(httpServer(app)).get('/v1/health');
    expect(response.status).toBe(200);
    const payload: unknown = response.body;
    expect(isHealthOk(payload)).toBe(true);
  });

  it('does not serve health on the unprefixed path', async () => {
    const response = await request(httpServer(app)).get('/health');
    expect(response.status).toBe(404);
  });
});
