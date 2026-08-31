import type { NextFunction, Request, Response } from 'express';

import { ClientTenantRejectionMiddleware } from './client-tenant-rejection.middleware';
import { ClientTenantContextForbiddenError } from './tenant-errors';

function run(middleware: ClientTenantRejectionMiddleware, req: Partial<Request>): void {
  middleware.use(req as Request, {} as Response, (() => undefined) as NextFunction);
}

describe('ClientTenantRejectionMiddleware', () => {
  const middleware = new ClientTenantRejectionMiddleware();

  it('P04_TEST_004 header x-tenant-id -> 400 CLIENT_TENANT_CONTEXT_FORBIDDEN', () => {
    expect(() =>
      { run(middleware, { headers: { 'x-tenant-id': 'anything' }, query: {}, body: {} }); },
    ).toThrow(ClientTenantContextForbiddenError);
  });

  it('P04_TEST_005 header tenant-id -> 400 CLIENT_TENANT_CONTEXT_FORBIDDEN', () => {
    expect(() => { run(middleware, { headers: { 'tenant-id': '' }, query: {}, body: {} }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_006 query tenant_id -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: { tenant_id: 'x' }, body: {} }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_007 query tenantId -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: { tenantId: 'x' }, body: {} }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_008 query org_id -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: { org_id: 'x' }, body: {} }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_009 body tenant_id -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: {}, body: { tenant_id: 'x' } }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_010 body tenantId -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: {}, body: { tenantId: 'x' } }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('P04_TEST_011 body org_id -> 400', () => {
    expect(() => { run(middleware, { headers: {}, query: {}, body: { org_id: 'x' } }); }).toThrow(
      ClientTenantContextForbiddenError,
    );
  });

  it('allows requests without prohibited selectors', () => {
    expect(() =>
      { run(middleware, { headers: {}, query: { other: '1' }, body: { name: 'x' } }); },
    ).not.toThrow();
  });
});
