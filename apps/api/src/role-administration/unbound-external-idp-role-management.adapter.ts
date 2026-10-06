import { Injectable } from '@nestjs/common';
import { TARGET_ROLE } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import {
  externalIdpRoleManagementRejection,
  ExternalIdpRoleManagementPort,
  type ExternalIdpRoleManagementRejectionCode,
  type ExternalIdpRoleManagementResult,
} from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';

const ROLE_OPERATIONS = new Set<string>(['GRANT', 'REVOKE']);

export class UnboundExternalIdpConfigurationRejectedError extends Error {
  readonly codes = ['CONFIGURATION_REJECTED'] as const;

  constructor() {
    super('CONFIGURATION_REJECTED');
    this.name = 'UnboundExternalIdpConfigurationRejectedError';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Unbound means no provider binding. undefined, null, and an empty plain
 * object carry no host, realm, secret, token, or client credential.
 */
export function isUnboundExternalIdpConfiguration(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }
  return (
    Object.getOwnPropertyNames(value).length === 0 &&
    Object.getOwnPropertySymbols(value).length === 0
  );
}

/**
 * PKG-02 unbound adapter.
 * It consults the PKG-01 policy gate, then returns before any network,
 * persistence, audit write, or role application.
 */
@Injectable()
export class UnboundExternalIdpRoleManagementAdapter extends ExternalIdpRoleManagementPort {
  readonly networkCallCount = 0 as const;
  readonly persistenceCallCount = 0 as const;
  readonly auditWriteCount = 0 as const;
  readonly idpCallCount = 0 as const;

  constructor(private readonly boundary: RoleAdministrationBoundaryService) {
    super();
  }

  static create(
    boundary: RoleAdministrationBoundaryService,
    configuration: unknown = {},
  ): UnboundExternalIdpRoleManagementAdapter {
    if (!isUnboundExternalIdpConfiguration(configuration)) {
      throw new UnboundExternalIdpConfigurationRejectedError();
    }
    return new UnboundExternalIdpRoleManagementAdapter(boundary);
  }

  requestRoleChange(
    actor: AuthenticatedActor | null | undefined,
    command: unknown,
  ): ExternalIdpRoleManagementResult {
    const boundaryResult = this.boundary.evaluate(actor, command);
    const codes: ExternalIdpRoleManagementRejectionCode[] = [];
    if (!boundaryResult.accepted) {
      codes.push(...boundaryResult.codes);
    }
    if (isPlainObject(command)) {
      const operation = command['operation'];
      if (typeof operation === 'string' && !ROLE_OPERATIONS.has(operation)) {
        codes.push('UNSUPPORTED_OPERATION');
      }
      const role = command['role'];
      if (typeof role === 'string' && role !== TARGET_ROLE) {
        codes.push('MANAGED_ROLE_FORBIDDEN');
      }
    }
    if (codes.length === 0) {
      codes.push('PROVIDER_UNBOUND');
    }
    return externalIdpRoleManagementRejection(codes);
  }
}
