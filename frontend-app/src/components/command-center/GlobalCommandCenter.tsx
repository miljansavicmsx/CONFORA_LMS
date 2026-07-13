import { NAVIGATION_NS } from "@confora/i18n";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import type { AppWorkspaceId } from "@/lib/app-workspace";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

import { useAuthStore } from "@/stores/authStore";

import { useCommandCenterStore } from "./command-center-store";
import type { CommandEntity } from "./command-entity-types";
import { CommandCenterDialog } from "./CommandCenterDialog";
import { buildCommandGroups } from "./command-search-engine";
import { buildCommandSearchIndex } from "./command-search-index";
import { pinnedProvider } from "./providers/pinned-provider";
import { recentProvider } from "./providers/recent-provider";
import { fetchRemoteCourseEntities } from "./providers/remote-courses-provider";
import { recordInvestigationJump } from "@/lib/workspace-continuity";
import { useDebouncedValue } from "./use-debounced-value";

export type GlobalCommandCenterProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly workspace: AppWorkspaceId;
  readonly isoCtx: IsoNavContext;
};

function pinSignature(e: Pick<CommandEntity, "entityType" | "route">): string {
  return `${e.entityType}:${e.route}`;
}

export function GlobalCommandCenter({ open, onOpenChange, workspace, isoCtx }: GlobalCommandCenterProps): JSX.Element | null {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 200);
  const [remote, setRemote] = useState<CommandEntity[]>([]);

  const hydrate = useCommandCenterStore((s) => s.hydrate);
  const pushRecent = useCommandCenterStore((s) => s.pushRecent);
  const togglePin = useCommandCenterStore((s) => s.togglePin);
  const isPinnedStore = useCommandCenterStore((s) => s.isPinned);
  const recentEntries = useCommandCenterStore((s) => s.recent);
  const pinnedEntries = useCommandCenterStore((s) => s.pinned);

  const userKey = useAuthStore((s) => `${s.user?.userId ?? s.user?.id ?? s.user?.email ?? ""}`);
  const { t: tNav } = useTranslation(NAVIGATION_NS);

  const baseIndex = useMemo(
    () => buildCommandSearchIndex(isoCtx, workspace, tNav),
    [isoCtx, workspace, tNav],
  );
  const recentEntities = useMemo(() => recentProvider(recentEntries), [recentEntries]);
  const pinnedEntities = useMemo(() => pinnedProvider(pinnedEntries), [pinnedEntries]);

  useEffect(() => {
    if (open) {
      hydrate();
    }
  }, [open, hydrate, userKey]);

  useEffect(() => {
    if (!open) {
      setRemote([]);
      return;
    }
    if (workspace !== "learning" || debounced.trim().length < 2) {
      setRemote([]);
      return;
    }
    const ac = new AbortController();
    void fetchRemoteCourseEntities(ac.signal).then(setRemote);
    return () => ac.abort();
  }, [open, debounced, workspace]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const groups = useMemo(
    () => buildCommandGroups(debounced, workspace, baseIndex, recentEntities, pinnedEntities, remote),
    [debounced, workspace, baseIndex, recentEntities, pinnedEntities, remote],
  );

  const onSelect = useCallback(
    (entity: CommandEntity, opts: { readonly newTab: boolean }) => {
      pushRecent(entity);
      onOpenChange(false);
      const path = entity.route.startsWith("/") ? entity.route : `/${entity.route}`;
      if (opts.newTab) {
        window.open(path, "_blank", "noopener,noreferrer");
        return;
      }
      recordInvestigationJump({
        workspace: entity.workspace,
        route: path,
        title: entity.title,
        ...(entity.subtitle ? { subtitle: entity.subtitle } : {}),
      });
      navigate(path);
    },
    [navigate, onOpenChange, pushRecent],
  );

  const isPinned = useCallback((e: CommandEntity) => isPinnedStore(pinSignature(e)), [isPinnedStore]);

  const handleTogglePin = useCallback(
    (e: CommandEntity) => {
      togglePin(e);
    },
    [togglePin],
  );

  if (!open) {
    return null;
  }

  return (
    <CommandCenterDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
      groups={groups}
      onSelect={onSelect}
      onTogglePin={handleTogglePin}
      isPinned={isPinned}
    />
  );
}
