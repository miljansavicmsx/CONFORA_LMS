import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandCenterDialog } from "@/components/command-center/CommandCenterDialog";
import type { CommandEntity } from "@/components/command-center/command-entity-types";
import type { CommandGroupModel } from "@/components/command-center/command-search-engine";

const entity = (over: Partial<CommandEntity>): CommandEntity => ({
  id: "e1",
  entityType: "course",
  title: "Demo kurs",
  workspace: "learning",
  route: "/dashboard/courses",
  source: "quick_action",
  resultBucket: "quick_actions",
  ...over,
});

const groups: readonly CommandGroupModel[] = [
  {
    bucket: "quick_actions",
    label: "Brze akcije",
    entities: [entity({})],
  },
];

describe("CommandCenterDialog accessibility smoke", () => {
  it("exposes dialog title and search hint to SR", () => {
    render(
      <CommandCenterDialog
        open
        onOpenChange={() => {}}
        search=""
        onSearchChange={() => {}}
        groups={groups}
        onSelect={() => {}}
        isPinned={() => false}
      />,
    );
    expect(screen.queryByText(/Globalni command center/i)).not.toBeNull();
    expect(screen.queryByText(/Pretražuj rute/i)).not.toBeNull();
  });

  it("invokes onOpenChange(false) on Escape", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <CommandCenterDialog
        open
        onOpenChange={onOpenChange}
        search=""
        onSearchChange={() => {}}
        groups={groups}
        onSelect={() => {}}
        isPinned={() => false}
      />,
    );
    fireEvent.keyDown(container, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
