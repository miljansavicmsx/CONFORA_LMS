import { Injectable, NotFoundException } from '@nestjs/common';
import type { CertificationApplication } from '@prisma/client';

import type { AuthenticatedActor } from '../auth/request-principal';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import type { CertificationApplicationListResponseDto } from './dto/certification-application-list-response.dto';
import type { CertificationApplicationResponseDto } from './dto/certification-application-response.dto';
import type { CertificationApplicationStatusValue } from './dto/list-certification-applications-query.dto';

const NOT_FOUND_MESSAGE = 'Certification application not found.';

export type ListCertificationApplicationsInput = {
  limit: number;
  offset: number;
  status?: CertificationApplicationStatusValue;
};

@Injectable()
export class CertificationApplicationsService {
  constructor(private readonly tenantPrisma: TenantPrismaService) {}

  async listApplications(
    actor: AuthenticatedActor,
    query: ListCertificationApplicationsInput,
  ): Promise<CertificationApplicationListResponseDto> {
    const where = {
      applicantUserId: actor.userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const rows = await this.tenantPrisma.certificationApplication.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      skip: query.offset,
    });

    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit).map((row) => this.toResponse(row));

    return {
      items,
      limit: query.limit,
      offset: query.offset,
      hasMore,
    };
  }

  async getApplicationById(
    actor: AuthenticatedActor,
    id: string,
  ): Promise<CertificationApplicationResponseDto> {
    const row = await this.tenantPrisma.certificationApplication.findFirst({
      where: {
        id,
        applicantUserId: actor.userId,
      },
    });

    if (!row) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    return this.toResponse(row);
  }

  private toResponse(row: CertificationApplication): CertificationApplicationResponseDto {
    return {
      id: row.id,
      status: row.status,
      schemeRef: row.schemeRef,
      submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
