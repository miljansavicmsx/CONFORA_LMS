import { createConforaI18n } from "@confora/i18n";
import { describe, expect, it } from "vitest";

import { buildCommandSearchIndex } from "@/components/command-center/command-search-index";
import {
  buildCommandGroups,
  parseCommandQuery,
  rankCommandEntities,
} from "@/components/command-center/command-search-engine";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

const qmIso: IsoNavContext = { role: "quality_manager", cognitoGroups: [], permissionsSnapshot: null };
const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });
const tNav = i18n.t.bind(i18n);

describe("command-search-engine", () => {
  it("parseCommandQuery extracts cert: shortcut", () => {
    const p = parseCommandQuery("cert: wallet");
    expect(p.shortcut?.kind).toBe("cert");
    expect(p.shortcut?.rest.length).toBeGreaterThan(0);
  });

  it("parseCommandQuery handles course:", () => {
    const p = parseCommandQuery("course: intro");
    expect(p.shortcut?.kind).toBe("course");
  });

  it("buildCommandGroups returns buckets for empty query", () => {
    const base = buildCommandSearchIndex(qmIso, "governance", tNav);
    const groups = buildCommandGroups("", "governance", base, [], [], []);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.some((g) => g.entities.length > 0)).toBe(true);
  });

  it("parseCommandQuery handles clause: shortcut", () => {
    const p = parseCommandQuery("clause: impartiality");
    expect(p.shortcut?.kind).toBe("clause");
  });

  it("risk: shortcut ranking prefers risk routes", () => {
    const base = buildCommandSearchIndex(qmIso, "governance", tNav);
    const ranked = rankCommandEntities(base, "governance", parseCommandQuery("risk:"));
    expect(ranked.length).toBeGreaterThan(0);
    const top = ranked[0]?.entity;
    expect(Boolean(top && (top.entityType === "risk" || top.route.toLowerCase().includes("risk")))).toBe(true);
  });
});
