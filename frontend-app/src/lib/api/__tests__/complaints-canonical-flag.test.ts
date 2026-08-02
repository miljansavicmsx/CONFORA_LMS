import { afterEach, describe, expect, it, vi } from "vitest";

import { isComplaintsCanonicalEnabled, parseComplaintsCanonicalEnabled } from "../complaints-canonical-flag";

describe("complaints-canonical-flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to true when unset", () => {
    vi.stubEnv("VITE_COMPLAINTS_CANONICAL_ENABLED", undefined);
    expect(parseComplaintsCanonicalEnabled(undefined)).toBe(true);
    expect(isComplaintsCanonicalEnabled()).toBe(true);
  });

  it("parses false variants", () => {
    expect(parseComplaintsCanonicalEnabled("false")).toBe(false);
    expect(parseComplaintsCanonicalEnabled("0")).toBe(false);
    expect(parseComplaintsCanonicalEnabled("no")).toBe(false);
  });

  it("parses true variants", () => {
    expect(parseComplaintsCanonicalEnabled("true")).toBe(true);
    expect(parseComplaintsCanonicalEnabled("1")).toBe(true);
  });
});
