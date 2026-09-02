import type { CertificationApplicationStatus } from '@prisma/client';

export type StatusGroupCell =
  | {
      status: CertificationApplicationStatus;
      suppressed: false;
      count: number;
    }
  | {
      status: CertificationApplicationStatus;
      suppressed: true;
    };

export type SchemeGroupCell =
  | {
      schemeRef: string;
      suppressed: false;
      count: number;
    }
  | {
      schemeRef: string;
      suppressed: true;
    };

export type ReportQueryStatusAggregateResult = {
  groups: StatusGroupCell[];
  total?: number;
};

export type ReportQuerySchemeRefAggregateResult = {
  groups: SchemeGroupCell[];
  total?: number;
};

export const SMALL_CELL_THRESHOLD = 5;
