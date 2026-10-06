import { Injectable } from '@nestjs/common';
import {
  evaluateRoleAdministrationPolicy,
  ROLE_ADMINISTRATION_POLICY_CODES,
  ROLE_GRANT_AUTHORITY,
  roleAdministrationContractSchema,
  type RoleAdministrationContract,
  type RoleAdministrationPolicyCode,
} from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { isRoleAdministrationLegacyRoleAlias } from './role-administration-legacy-aliases';
import {
  ACCEPTED_BOUNDARY_RESULT,
  ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES,
  type RoleAdministrationBoundaryRejectionCode,
  type RoleAdministrationBoundaryResult,
} from './role-administration-boundary.types';

const POLICY_CODE_SET: ReadonlySet<string> = new Set(ROLE_ADMINISTRATION_POLICY_CODES);
const REJECTION_ORDER: readonly string[] = [
  ...ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES,
  ...ROLE_ADMINISTRATION_POLICY_CODES,
];

function nonEmpty(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPolicyCode(value: string): value is RoleAdministrationPolicyCode {
  return POLICY_CODE_SET.has(value);
}

function reject(
  codes: readonly RoleAdministrationBoundaryRejectionCode[],
): RoleAdministrationBoundaryResult {
  const unique = [...new Set(codes)];
  unique.sort((left, right) => REJECTION_ORDER.indexOf(left) - REJECTION_ORDER.indexOf(right));
  return { accepted: false, codes: unique };
}

function decisionParty(
  contract: RoleAdministrationContract,
): { userId: string; subject: string } | null {
  if (contract.operation === 'GRANT') {
    if (contract.decision === 'REQUESTED') {
      return {
        userId: contract.initiatorUserId,
        subject: contract.initiatorExternalSubjectId,
      };
    }
    if (
      contract.decision === 'APPROVED' ||
      contract.decision === 'APPLIED' ||
      contract.decision === 'REJECTED' ||
      contract.decision === 'FAILED'
    ) {
      if (
        contract.decision === 'FAILED' &&
        contract.approverUserId === undefined &&
        contract.approverExternalSubjectId === undefined
      ) {
        return {
          userId: contract.initiatorUserId,
          subject: contract.initiatorExternalSubjectId,
        };
      }
      if (
        contract.approverUserId === undefined ||
        contract.approverExternalSubjectId === undefined
      ) {
        return null;
      }
      return {
        userId: contract.approverUserId,
        subject: contract.approverExternalSubjectId,
      };
    }
    return null;
  }

  if (contract.decision === 'APPROVED') {
    return null;
  }
  if (contract.decision === 'REVIEWED') {
    const userId = contract.reviewerUserId ?? contract.approverUserId;
    const subject = contract.reviewerExternalSubjectId ?? contract.approverExternalSubjectId;
    if (userId === undefined || subject === undefined) {
      return null;
    }
    return { userId, subject };
  }

  const userId = contract.actorUserId ?? contract.initiatorUserId;
  const subject = contract.actorExternalSubjectId ?? contract.initiatorExternalSubjectId;
  return { userId, subject };
}

/**
 * Fail-closed pairing derived from four-eyes grant and immediate revoke.
 * A command cannot claim a terminal assignment state that the decision name
 * does not produce. This is not a complaint or appeal workflow.
 */
function isAllowedStatePair(contract: RoleAdministrationContract): boolean {
  const { operation, decision, previousState, resultingState } = contract;
  if (operation === 'GRANT' && decision === 'REVIEWED') {
    return false;
  }
  if (operation === 'REVOKE' && decision === 'APPROVED') {
    return false;
  }
  if (operation === 'GRANT' && decision === 'REQUESTED') {
    return previousState === 'ABSENT' && resultingState === 'PENDING';
  }
  if (operation === 'GRANT' && decision === 'APPROVED') {
    return previousState === 'PENDING' && resultingState === 'PENDING';
  }
  if (operation === 'GRANT' && decision === 'APPLIED') {
    return previousState === 'PENDING' && resultingState === 'ACTIVE';
  }
  if (operation === 'GRANT' && decision === 'REJECTED') {
    return previousState === 'PENDING' && resultingState === 'ABSENT';
  }
  if (operation === 'REVOKE' && (decision === 'REQUESTED' || decision === 'REJECTED')) {
    return previousState === 'ACTIVE' && resultingState === 'ACTIVE';
  }
  if (operation === 'REVOKE' && decision === 'APPLIED') {
    return previousState === 'ACTIVE' && resultingState === 'REVOKED';
  }
  if (operation === 'REVOKE' && decision === 'REVIEWED') {
    return previousState === 'REVOKED' && resultingState === 'REVOKED';
  }
  if (decision === 'FAILED') {
    return previousState === resultingState;
  }
  return false;
}

/**
 * PKG-01 application boundary.
 * The authenticated actor is the authority source. Metadata role fields are
 * necessary and not sufficient. This service performs no I/O.
 */
@Injectable()
export class RoleAdministrationBoundaryService {
  evaluate(
    actor: AuthenticatedActor | null | undefined,
    command: unknown,
  ): RoleAdministrationBoundaryResult {
    if (actor == null) {
      return reject(['ACTOR_NOT_AUTHENTICATED']);
    }

    const identityCodes: RoleAdministrationBoundaryRejectionCode[] = [];
    if (!nonEmpty(actor.userId)) {
      identityCodes.push('ACTOR_USER_ID_EMPTY');
    }
    if (!nonEmpty(actor.subject)) {
      identityCodes.push('ACTOR_SUBJECT_EMPTY');
    }
    if (!nonEmpty(actor.tenantId)) {
      identityCodes.push('ACTOR_TENANT_EMPTY');
    }
    if (identityCodes.length > 0) {
      return reject(identityCodes);
    }

    const codes: RoleAdministrationBoundaryRejectionCode[] = [];
    if (!actor.mfaVerified) {
      codes.push('MFA_ASSURANCE_REQUIRED');
    }
    if (!actor.roles.includes(ROLE_GRANT_AUTHORITY)) {
      codes.push('ACTOR_AUTHORITY_ROLE_MISSING');
    }

    if (!isPlainObject(command)) {
      codes.push('COMMAND_SCHEMA_REJECTED');
      return reject(codes);
    }

    const role = command['role'];
    if (typeof role === 'string' && isRoleAdministrationLegacyRoleAlias(role)) {
      codes.push('LEGACY_ROLE_ALIAS_REJECTED');
    }

    const parsed = roleAdministrationContractSchema.safeParse(command);
    if (!parsed.success) {
      codes.push('COMMAND_SCHEMA_REJECTED');
      for (const issue of parsed.error.issues) {
        if (isPolicyCode(issue.message)) {
          codes.push(issue.message);
        }
      }
      return reject(codes);
    }

    const contract = parsed.data;
    if (actor.tenantId !== contract.tenantId) {
      codes.push('ACTOR_TENANT_MISMATCH');
    }
    for (const policyCode of evaluateRoleAdministrationPolicy(contract, {
      actorTenantId: actor.tenantId,
    })) {
      codes.push(policyCode);
    }

    const party = decisionParty(contract);
    if (party === null || actor.userId !== party.userId || actor.subject !== party.subject) {
      codes.push('ACTOR_DECISION_PARTY_MISMATCH');
    }
    if (!isAllowedStatePair(contract)) {
      codes.push('INVALID_STATE_TRANSITION');
    }

    if (codes.length > 0) {
      return reject(codes);
    }
    return ACCEPTED_BOUNDARY_RESULT;
  }
}
