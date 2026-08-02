import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AiTutorPanel } from "@/components/learning/AiTutorPanel";

const openPanel = vi.fn();
const sendMessage = vi.fn();
const togglePanel = vi.fn();

vi.mock("@/store/aiTutorPlayerStore", () => ({
  useAiTutorPlayerStore: (sel: (s: unknown) => unknown) =>
    sel({
      openPanel,
      sendMessage,
      togglePanel,
    }),
}));

describe("AiTutorPanel", () => {
  it("šalje predloženi upit kada se klikne brzi gumb", () => {
    render(<AiTutorPanel />);

    fireEvent.click(screen.getByRole("button", { name: /Pitaj o ovoj lekciji/i }));
    expect(openPanel).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalled();
  });
});
