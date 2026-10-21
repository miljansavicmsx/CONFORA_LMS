import { randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import {
  DEFAULT_AI_COST_LIMIT_MINOR,
  DEFAULT_AI_UNIT_LIMIT,
  periodKey,
  type AiBudgetRow,
} from './ai-policy';

type BudgetClient = Pick<Prisma.TransactionClient, 'tenantAiBudget'>;

export async function loadAiBudget(
  client: BudgetClient,
  tenantId: string,
  now: Date,
): Promise<AiBudgetRow> {
  const key = periodKey(now);
  const existing = await client.tenantAiBudget.findUnique({
    where: { tenantId_periodKey: { tenantId, periodKey: key } },
  });
  if (existing) {
    return existing;
  }
  return client.tenantAiBudget.create({
    data: {
      id: randomUUID(),
      tenantId,
      periodKey: key,
      unitLimit: DEFAULT_AI_UNIT_LIMIT,
      unitsUsed: 0,
      costLimitMinor: DEFAULT_AI_COST_LIMIT_MINOR,
      costUsedMinor: 0,
    },
  });
}

export async function consumeAiBudget(
  client: BudgetClient,
  tenantId: string,
  now: Date,
  promptUnits: number,
  completionUnits: number,
  costMinor: number,
): Promise<void> {
  const key = periodKey(now);
  await client.tenantAiBudget.update({
    where: { tenantId_periodKey: { tenantId, periodKey: key } },
    data: {
      unitsUsed: { increment: promptUnits + completionUnits },
      costUsedMinor: { increment: costMinor },
    },
  });
}
