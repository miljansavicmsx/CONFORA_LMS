import { AuditError, AUDIT_EVENT_NOT_REGISTERED, AUDIT_INVALID_INPUT } from './audit-errors';
import { AUDIT_EVENT_TYPE_PATTERN, type AuditEventDefinition } from './audit-event.types';

/**
 * Static production registry starts empty (BAR_P05_INITIAL_PRODUCTION_EVENT_COUNT = 0).
 * Runtime dynamic registration is forbidden. Tests may construct a registry with
 * additional static definitions via the constructor.
 */
export class AuditEventRegistry {
  private readonly byType: ReadonlyMap<string, AuditEventDefinition>;

  constructor(definitions: readonly AuditEventDefinition[] = []) {
    const map = new Map<string, AuditEventDefinition>();
    for (const def of definitions) {
      if (!AUDIT_EVENT_TYPE_PATTERN.test(def.eventType)) {
        throw new AuditError(
          AUDIT_INVALID_INPUT,
          'Audit event identifier must match UPPER_SNAKE pattern.',
        );
      }
      if (map.has(def.eventType)) {
        throw new AuditError(AUDIT_INVALID_INPUT, 'Duplicate audit event definition.');
      }
      map.set(def.eventType, Object.freeze({ ...def }));
    }
    this.byType = map;
  }

  /** Production default: zero event definitions. */
  static production(): AuditEventRegistry {
    return new AuditEventRegistry([]);
  }

  size(): number {
    return this.byType.size;
  }

  get(eventType: string): AuditEventDefinition {
    const def = this.byType.get(eventType);
    if (!def) {
      throw new AuditError(AUDIT_EVENT_NOT_REGISTERED, 'Audit event is not registered.');
    }
    return def;
  }

  has(eventType: string): boolean {
    return this.byType.has(eventType);
  }
}
