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
  it('writes a FAILURE audit entry and rethrows the provider error', async () => {
    const audits: Array<{ outcome: string; metadata: { costMinor: number } }> = [];
    const released: number[] = [];
    const tenantPrisma = {
      aiBudget: {
        reserve: () => Promise.resolve(true),
        release: (_now: Date, units: number, costMinor: number) => {
          released.push(units, costMinor);
          return Promise.resolve();
        },
      },
    };
    const audit = {
      append: (
        _actor: AuthenticatedActor,
        event: { outcome: string; metadata: { costMinor: number } },
      ) => {
        audits.push(event);
        return Promise.resolve();
      },
    };
    const service = new AiGatewayService(
      tenantPrisma as unknown as TenantPrismaService,
      audit as unknown as AuditService,
    );
    const actor = { userId: '11111111-1111-4111-8111-111111111111' } as AuthenticatedActor;
    await expect(
      service.complete(actor, {
        purpose: 'summary',
        dataCategory: 'case_summary',
        system: 'Pomoć.',
        prompt: 'Činjenice.',
      }),
    ).rejects.toThrow('PROVIDER_DOWN');
    expect(audits).toHaveLength(1);
    expect(audits[0]?.outcome).toBe('FAILURE');
    expect(audits[0]?.metadata.costMinor).toBeGreaterThan(0);
    expect(released[0]).toBeGreaterThan(0);
  });
});
