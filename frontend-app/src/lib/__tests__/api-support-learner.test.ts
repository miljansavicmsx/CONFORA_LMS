import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import { fetchLearnerSupportTickets } from "@/lib/api-support";

describe("fetchLearnerSupportTickets", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it("returns empty tickets when API succeeds with no rows", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });
    const result = await fetchLearnerSupportTickets();
    expect(result.tickets).toEqual([]);
    expect(result.unavailable).toBe(false);
  });

  it("returns unavailable flag on API failure instead of throwing", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("network"));
    const result = await fetchLearnerSupportTickets();
    expect(result.tickets).toEqual([]);
    expect(result.unavailable).toBe(true);
  });
});
