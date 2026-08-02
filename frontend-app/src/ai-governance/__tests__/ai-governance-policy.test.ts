import { describe, expect, it } from "vitest";

import { aiConfidenceBandFromScore01, aiCopyContainsProhibitedPhrase } from "@/ai-governance";

describe("ai governance policies", () => {
  it("flags prohibited copy", () => {
    expect(aiCopyContainsProhibitedPhrase("Ovo je automatska odluka")).not.toBeNull();
    expect(aiCopyContainsProhibitedPhrase("Human review required")).toBeNull();
  });

  it("maps confidence bands", () => {
    expect(aiConfidenceBandFromScore01(0.8)).toBe("high");
    expect(aiConfidenceBandFromScore01(0)).toBe("unknown");
  });
});
