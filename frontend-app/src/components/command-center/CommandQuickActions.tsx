import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ds } from "@/design-system/tokens";
import type { AppWorkspaceId } from "@/lib/app-workspace";

import { quickActionsProvider } from "./providers/quick-actions-provider";

type CommandQuickActionsProps = {
  readonly workspace: AppWorkspaceId;
  readonly onNavigate: (route: string) => void;
  readonly className?: string;
};

/** Kompaktan red brzih akcija (workspace-aware) — može se koristiti izvan cmdk liste. */
export function CommandQuickActions({ workspace, onNavigate, className }: CommandQuickActionsProps): JSX.Element {
  const items = quickActionsProvider(workspace).slice(0, 6);
  return (
    <div className={className} role="toolbar" aria-label="Brze akcije command centra">
      <div className="flex flex-wrap gap-2">
        {items.map((e) => (
          <Button
            key={e.id}
            type="button"
            size="sm"
            variant="outline"
            className={cn("h-8 rounded-full px-3 text-xs", ds.focusRing)}
            onClick={() => onNavigate(e.route)}
          >
            {e.title}
          </Button>
        ))}
      </div>
    </div>
  );
}
