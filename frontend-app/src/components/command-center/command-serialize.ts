import type { CommandEntity, PersistedCommandEntity } from "./command-entity-types";

export function serializeEntityForStorage(entity: CommandEntity): PersistedCommandEntity {
  const { icon: _icon, ...rest } = entity;
  return rest;
}
