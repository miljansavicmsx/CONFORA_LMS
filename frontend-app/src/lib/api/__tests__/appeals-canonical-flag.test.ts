import { afterEach, describe, expect, it, vi } from "vitest";

import { isAppealsCanonicalEnabled, parseAppealsCanonicalEnabled } from "../appeals-canonical-flag";

describe("appeals-canonical-flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to true when unset", () => {
    vi.stubEnv("VITE_APPEALS_CANONICAL_ENABLED", undefined);
    expect(parseAppealsCanonicalEnabled(undefined)).toBe(true);
    expect(isAppealsCanonicalEnabled()).toBe(true);
  });

  it("parses false variants", () => {
    expect(parseAppealsCanonicalEnabled("false")).toBe(false);
    expect(parseAppealsCanonicalEnabled("0")).toBe(false);
    expect(parseAppealsCanonicalEnabled("no")).toBe(false);
  });

  it("parses true variants", () => {
    expect(parseAppealsCanonicalEnabled("true")).toBe(true);
    expect(parseAppealsCanonicalEnabled("1")).toBe(true);
  });
});
