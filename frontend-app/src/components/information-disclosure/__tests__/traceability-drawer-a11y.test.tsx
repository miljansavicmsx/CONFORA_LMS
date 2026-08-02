import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TraceabilityDrawer } from "@/components/information-disclosure/TraceabilityDrawer";

describe("traceability drawer keyboard", () => {
  it("closes on Escape and calls onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    render(
      <TraceabilityDrawer open title="Trag" description="Opis" onOpenChange={onOpenChange}>
        <p>Sadržaj</p>
      </TraceabilityDrawer>,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
