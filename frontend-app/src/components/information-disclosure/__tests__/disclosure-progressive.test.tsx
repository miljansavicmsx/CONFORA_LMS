import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ContextRibbon } from "@/components/information-disclosure/ContextRibbon";
import { ProgressivePanel } from "@/components/information-disclosure/ProgressivePanel";
import { TraceabilityDrawer } from "@/components/information-disclosure/TraceabilityDrawer";

describe("progressive disclosure", () => {
  it("renders summary and insight open by default", () => {
    render(
      <ProgressivePanel summary={<p>Sum text</p>} insight={<p>Insight text</p>} detail={<p>Detail text</p>} />,
    );
    expect(screen.queryByText("Sum text")).not.toBeNull();
    expect(screen.queryByText("Insight text")).not.toBeNull();
  });

  it("keeps detail collapsed until summary is toggled (keyboard-friendly details)", () => {
    const { container } = render(
      <ProgressivePanel summary={<p>S</p>} insight={<p>I</p>} detail={<p>Hidden detail</p>} />,
    );
    const detailsEls = container.querySelectorAll("details");
    expect(detailsEls.length).toBeGreaterThanOrEqual(3);
    const detailBlock = [...detailsEls].find((d) => d.textContent?.includes("Hidden detail"));
    expect(detailBlock).toBeTruthy();
    expect(detailBlock?.open).toBe(false);
    const summary = detailBlock?.querySelector("summary");
    expect(summary).toBeTruthy();
    fireEvent.click(summary!);
    expect(detailBlock?.open).toBe(true);
    expect(screen.queryByText("Hidden detail")).not.toBeNull();
  });
});

describe("context ribbon", () => {
  it("exposes SR hint and links for quick jumps", () => {
    render(
      <MemoryRouter>
        <ContextRibbon
          title="Skokovi"
          items={[{ id: "1", label: "Rizici", to: "/iso/risks", hint: "Vidi register" }]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation", { name: "Skokovi" })).toBeTruthy();
    expect(screen.queryByText(/Brzi skokovi/i)).not.toBeNull();
    const link = screen.getByRole("link", { name: /Rizici/i });
    expect(link.getAttribute("href")).toBe("/iso/risks");
  });
});

describe("traceability drawer (accessible dialog)", () => {
  it("shows dialog title when open", async () => {
    const onOpenChange = vi.fn();
    render(
      <TraceabilityDrawer open title="Trag" description="Opis" onOpenChange={onOpenChange}>
        <p>Sadržaj</p>
      </TraceabilityDrawer>,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
    expect(screen.getByText("Trag")).toBeTruthy();
    expect(screen.getByText("Sadržaj")).toBeTruthy();
  });
});
