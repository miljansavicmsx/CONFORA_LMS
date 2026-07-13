import { create } from "zustand";

import { useAuthStore } from "@/stores/authStore";

import type { CommandEntity, PersistedCommandEntity } from "./command-entity-types";
import { serializeEntityForStorage } from "./command-serialize";

export type RecentEntry = {
  readonly entity: PersistedCommandEntity;
  readonly visitedAt: string;
};

export type PinnedEntry = {
  readonly entity: PersistedCommandEntity;
  readonly pinnedAt: string;
};

export type CommandCenterStorageSnapshot = {
  readonly recent: readonly RecentEntry[];
  readonly pinned: readonly PinnedEntry[];
};

const MAX_RECENT = 28;
const MAX_PINNED = 24;

function userStorageSuffix(): string {
  const u = useAuthStore.getState().user;
  const raw = (u?.userId ?? u?.id ?? u?.email ?? "anon").trim() || "anon";
  return encodeURIComponent(raw);
}

export function commandCenterStorageKey(): string {
  return `confora.command-center.v1.${userStorageSuffix()}`;
}

function readSnapshot(): CommandCenterStorageSnapshot {
  try {
    const raw = localStorage.getItem(commandCenterStorageKey());
    if (!raw) return { recent: [], pinned: [] };
    const parsed = JSON.parse(raw) as Partial<CommandCenterStorageSnapshot>;
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
    };
  } catch {
    return { recent: [], pinned: [] };
  }
}

function writeSnapshot(s: CommandCenterStorageSnapshot): void {
  try {
    localStorage.setItem(commandCenterStorageKey(), JSON.stringify(s));
  } catch {
    /* private mode / quota */
  }
}

export type CommandCenterState = {
  readonly recent: readonly RecentEntry[];
  readonly pinned: readonly PinnedEntry[];
  readonly hydrated: boolean;
  hydrate: () => void;
  pushRecent: (entity: CommandEntity) => void;
  togglePin: (entity: CommandEntity) => void;
  unpin: (signature: string) => void;
  isPinned: (signature: string) => boolean;
};

function signatureFromPersisted(e: PersistedCommandEntity): string {
  return `${e.entityType}:${e.route}`;
}

export const useCommandCenterStore = create<CommandCenterState>((set, get) => ({
  recent: [],
  pinned: [],
  hydrated: false,

  hydrate: () => {
    const snap = readSnapshot();
    set({
      recent: snap.recent.slice(0, MAX_RECENT),
      pinned: snap.pinned.slice(0, MAX_PINNED),
      hydrated: true,
    });
  },

  pushRecent: (entity) => {
    const persisted = serializeEntityForStorage(entity);
    const sig = signatureFromPersisted(persisted);
    const now = new Date().toISOString();
    const prev = get().recent.filter((r) => signatureFromPersisted(r.entity) !== sig);
    const next: RecentEntry[] = [{ entity: persisted, visitedAt: now }, ...prev].slice(0, MAX_RECENT);
    set({ recent: next, hydrated: true });
    writeSnapshot({ recent: next, pinned: [...get().pinned] });
  },

  togglePin: (entity) => {
    const persisted = serializeEntityForStorage(entity);
    const sig = signatureFromPersisted(persisted);
    const pinned = [...get().pinned];
    const ix = pinned.findIndex((p) => signatureFromPersisted(p.entity) === sig);
    if (ix >= 0) {
      pinned.splice(ix, 1);
    } else {
      pinned.unshift({ entity: persisted, pinnedAt: new Date().toISOString() });
    }
    const nextPinned = pinned.slice(0, MAX_PINNED);
    set({ pinned: nextPinned, hydrated: true });
    writeSnapshot({ recent: [...get().recent], pinned: nextPinned });
  },

  unpin: (signature) => {
    const nextPinned = get().pinned.filter((p) => signatureFromPersisted(p.entity) !== signature);
    set({ pinned: nextPinned });
    writeSnapshot({ recent: [...get().recent], pinned: nextPinned });
  },

  isPinned: (signature) => get().pinned.some((p) => signatureFromPersisted(p.entity) === signature),
}));

/** Imperativno za npr. detalj stranice (bez React hooka). */
export function recordCommandEntityVisit(entity: CommandEntity): void {
  useCommandCenterStore.getState().pushRecent(entity);
}

export function togglePinnedCommandEntity(entity: CommandEntity): void {
  useCommandCenterStore.getState().togglePin(entity);
}
