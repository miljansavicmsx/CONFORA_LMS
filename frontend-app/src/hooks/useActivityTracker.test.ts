import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { useActivityTracker } from "./useActivityTracker";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(() => Promise.resolve({ data: { status: "ok" } })),
  },
}));

const THREE_MIN_MS = 3 * 60 * 1000;
const THROTTLE_MS = 500;
const HEARTBEAT_MS = 10_000;

function dispatchMouseMove(): void {
  window.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
}

describe("useActivityTracker — idle detection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(api.post).mockClear();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("postaje idle nakon 3 minute bez aktivnosti", () => {
    const { result } = renderHook(() => useActivityTracker("lesson-a"));

    expect(result.current.isIdle).toBe(false);

    act(() => {
      vi.advanceTimersByTime(THREE_MIN_MS);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it("nakon burst događaja unutar 500 ms idle i dalje dolazi nakon punih 3 min od zadnjeg throttle reset-a", () => {
    const { result } = renderHook(() => useActivityTracker("lesson-b"));

    act(() => {
      for (let i = 0; i < 30; i++) {
        dispatchMouseMove();
      }
    });

    expect(result.current.isIdle).toBe(false);

    act(() => {
      vi.advanceTimersByTime(THREE_MIN_MS);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it("aktivnost nakon isteka throttle prozora ponovno produžuje idle timeout", () => {
    const { result } = renderHook(() => useActivityTracker("lesson-c"));

    act(() => {
      dispatchMouseMove();
      vi.advanceTimersByTime(THROTTLE_MS + 50);
      dispatchMouseMove();
      vi.advanceTimersByTime(THREE_MIN_MS);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it("nakon idle-a nova aktivnost vraća isIdle na false", () => {
    const { result } = renderHook(() => useActivityTracker("lesson-d"));

    act(() => {
      vi.advanceTimersByTime(THREE_MIN_MS);
    });
    expect(result.current.isIdle).toBe(true);

    act(() => {
      vi.advanceTimersByTime(THROTTLE_MS);
      dispatchMouseMove();
    });

    expect(result.current.isIdle).toBe(false);
  });

  it("heartbeat se ne šalje dok je korisnik idle", () => {
    const { result } = renderHook(() => useActivityTracker("lesson-e"));

    act(() => {
      vi.advanceTimersByTime(THREE_MIN_MS);
    });
    expect(result.current.isIdle).toBe(true);

    vi.mocked(api.post).mockClear();

    act(() => {
      vi.advanceTimersByTime(HEARTBEAT_MS * 3);
    });

    const heartbeatCalls = vi.mocked(api.post).mock.calls.filter(
      (c) => c[0] === "/api/learning/heartbeat",
    );
    expect(heartbeatCalls.length).toBe(0);
  });
});

describe("useActivityTracker — flush i vidljivost", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(api.post).mockClear();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pri unmount šalje session-complete s total_active_ms", async () => {
    const { unmount } = renderHook(() => useActivityTracker("lesson-f"));

    act(() => {
      vi.advanceTimersByTime(HEARTBEAT_MS);
    });

    vi.mocked(api.post).mockClear();

    act(() => {
      unmount();
    });

    await vi.waitFor(() => {
      expect(vi.mocked(api.post)).toHaveBeenCalled();
    });

    const completeCall = vi.mocked(api.post).mock.calls.find(
      (c) => c[0] === "/api/learning/session-complete",
    );
    expect(completeCall).toBeDefined();
    const body = completeCall?.[1] as { lessonId: string; total_active_ms: number };
    expect(body.lessonId).toBe("lesson-f");
    expect(body.total_active_ms).toBe(10_000);
  });

  it("kad tab nije vidljiv, heartbeat se ne izvršava u intervalu", () => {
    renderHook(() => useActivityTracker("lesson-g"));

    act(() => {
      vi.advanceTimersByTime(HEARTBEAT_MS);
    });

    vi.mocked(api.post).mockClear();

    act(() => {
      Object.defineProperty(document, "hidden", { value: true, configurable: true, writable: true });
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(HEARTBEAT_MS * 2);
    });

    const heartbeats = vi.mocked(api.post).mock.calls.filter(
      (c) => c[0] === "/api/learning/heartbeat",
    );
    expect(heartbeats.length).toBe(0);
  });
});
