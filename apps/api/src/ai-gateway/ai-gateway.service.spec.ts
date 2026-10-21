import { AiGatewayService } from './ai-gateway.service';
import type { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import type { TenantPrismaService } from '../prisma/tenant-prisma.service';

jest.mock('./ai-provider', () => ({
  selectAiProvider: () => ({
    id: 'deterministic-stub',
    model: 'deterministic-stub',
    plan: () => ({ promptUnits: 2, completionUnits: 1 }),
    complete: () => Promise.reject(new Error('PROVIDER_DOWN')),
  }),
}));

describe('AiGatewayService provider failure', () => {
  const actor = { userId: '11111111-1111-4111-8111-111111111111' } as AuthenticatedActor;
  const request = {
    purpose: 'summary',
    dataCategory: 'case_summary',
    system: 'Pomoć.',
    prompt: 'Činjenice.',
  };

  function serviceFor(input: {
    order: string[];
    audits: Array<{ outcome: string; metadata: { costMinor: number } }>;
    released: number[];
    release: () => Promise<void>;
  }): AiGatewayService {
    const tenantPrisma = {
      aiBudget: {
        reserve: () => Promise.resolve(true),
        release: (_now: Date, units: number, costMinor: number) => {
          input.order.push('release');
          input.released.push(units, costMinor);
          return input.release();
        },
      },
    };
    const audit = {
      append: (
        _actor: AuthenticatedActor,
        event: { outcome: string; metadata: { costMinor: number } },
      ) => {
        input.order.push(event.outcome);
        input.audits.push(event);
        return Promise.resolve();
      },
    };
    return new AiGatewayService(
      tenantPrisma as unknown as TenantPrismaService,
      audit as unknown as AuditService,
    );
  }

  it('writes a FAILURE audit entry before release and rethrows the provider error', async () => {
    const order: string[] = [];
    const audits: Array<{ outcome: string; metadata: { costMinor: number } }> = [];
    const released: number[] = [];
    const service = serviceFor({
      order,
      audits,
      released,
      release: () => Promise.resolve(),
    });
    await expect(service.complete(actor, request)).rejects.toThrow('PROVIDER_DOWN');
    expect(order).toEqual(['FAILURE', 'release']);
    expect(audits).toHaveLength(1);
    expect(audits[0]?.outcome).toBe('FAILURE');
    expect(audits[0]?.metadata.costMinor).toBeGreaterThan(0);
    expect(released[0]).toBeGreaterThan(0);
  });

  it('still writes the FAILURE audit when release throws', async () => {
    const order: string[] = [];
    const audits: Array<{ outcome: string; metadata: { costMinor: number } }> = [];
    const service = serviceFor({
      order,
      audits,
      released: [],
      release: () => Promise.reject(new Error('RELEASE_FAILED')),
    });
    await expect(service.complete(actor, request)).rejects.toThrow('RELEASE_FAILED');
    expect(order).toEqual(['FAILURE', 'release']);
    expect(audits[0]?.outcome).toBe('FAILURE');
  });
});
