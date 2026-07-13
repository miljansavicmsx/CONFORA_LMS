import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { CommandEntity } from "@/components/command-center/command-entity-types";
import { useCommandCenterStore } from "@/components/command-center/command-center-store";
import { useAuthStore } from "@/stores/authStore";

function mk(route: string, entityType: CommandEntity["entityType"] = "course"): CommandEntity {
  return {
    id: `t-${route}`,
    entityType,
    title: `Title ${route}`,
    workspace: "learning",
    route,
    source: "nav",
  };
}

describe("command-center-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: { email: "cc-test@example.com", userId: "u-cc" },
      isAuthenticated: true,
    });
    useCommandCenterStore.setState({ recent: [], pinned: [], hydrated: false });
    useCommandCenterStore.getState().hydrate();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("pushRecent prepends and dedupes by route", () => {
    useCommandCenterStore.getState().pushRecent(mk("/a"));
    useCommandCenterStore.getState().pushRecent(mk("/b"));
    expect(useCommandCenterStore.getState().recent).toHaveLength(2);
    useCommandCenterStore.getState().pushRecent(mk("/a"));
    expect(useCommandCenterStore.getState().recent).toHaveLength(2);
    expect(useCommandCenterStore.getState().recent[0]?.entity.route).toBe("/a");
  });

  it("togglePin adds, isPinned true, then removes", () => {
    const e = mk("/p1", "capa");
    useCommandCenterStore.getState().togglePin(e);
    expect(useCommandCenterStore.getState().pinned).toHaveLength(1);
    expect(useCommandCenterStore.getState().isPinned(`${e.entityType}:${e.route}`)).toBe(true);
    useCommandCenterStore.getState().togglePin(e);
    expect(useCommandCenterStore.getState().pinned).toHaveLength(0);
  });
});
