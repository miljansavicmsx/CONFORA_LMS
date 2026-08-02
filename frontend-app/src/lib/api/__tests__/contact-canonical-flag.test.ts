import { describe, expect, it, vi, afterEach } from "vitest";

import { isContactCanonicalEnabled, parseContactCanonicalEnabled } from "../contact-canonical-flag";

describe("contact-canonical-flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to true when unset", () => {
    vi.stubEnv("VITE_CONTACT_CANONICAL_ENABLED", undefined);
    expect(parseContactCanonicalEnabled(undefined)).toBe(true);
    expect(isContactCanonicalEnabled()).toBe(true);
  });

  it("parses false variants", () => {
    expect(parseContactCanonicalEnabled("false")).toBe(false);
    expect(parseContactCanonicalEnabled("0")).toBe(false);
    expect(parseContactCanonicalEnabled("no")).toBe(false);
  });

  it("parses true variants", () => {
    expect(parseContactCanonicalEnabled("true")).toBe(true);
    expect(parseContactCanonicalEnabled("1")).toBe(true);
  });
});
