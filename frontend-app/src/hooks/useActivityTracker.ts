import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";

const HEARTBEAT_MS = 10_000;
const IDLE_MS = 3 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 500;

const PASSIVE: AddEventListenerOptions = { passive: true };

export interface UseActivityTrackerOptions {
  readonly enabled?: boolean;
  /** Upis u DynamoDB learningProgress + provjera enrollments. */
  readonly courseId?: string | null;
}

export interface UseActivityTrackerResult {
  readonly activeTimeSeconds: number;
  readonly isIdle: boolean;
  readonly isVisible: boolean;
}

function buildBaseBody(lessonId: string, courseId: string | null): Record<string, unknown> {
  return courseId ? { lessonId, courseId } : { lessonId };
}

async function postHeartbeat(lessonId: string, courseId: string | null): Promise<void> {
  try {
    await api.post("/api/learning/heartbeat", {
      ...buildBaseBody(lessonId, courseId),
      delta_seconds: 10,
    });
  } catch (e) {
    console.warn("[useActivityTracker] heartbeat failed", e);
  }
}

async function postSessionComplete(
  lessonId: string,
  courseId: string | null,
  totalActiveMs: number,
): Promise<void> {
  try {
    await api.post("/api/learning/session-complete", {
      ...buildBaseBody(lessonId, courseId),
      total_active_ms: totalActiveMs,
    });
  } catch (e) {
    console.warn("[useActivityTracker] session-complete failed", e);
  }
}

async function postXapi(lessonId: string, verb: "paused" | "resumed"): Promise<void> {
  try {
    await api.post("/api/learning/xapi", { lessonId, verb });
  } catch (e) {
    console.warn("[useActivityTracker] xapi failed", e);
  }
}

/**
 * Praćenje aktivnog učenja: heartbeat 10s, idle 3 min, visibility, flush pri zatvaranju.
 * Koristi autenticirani Axios (`api`) — JWT interceptor.
 */
export function useActivityTracker(
  lessonId: string | null,
  options?: UseActivityTrackerOptions,
): UseActivityTrackerResult {
  const enabled = options?.enabled !== false;
  const courseId = options?.courseId?.trim() || null;

  const [activeTimeSeconds, setActiveTimeSeconds] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [isVisible, setIsVisible] = useState(() =>
    typeof document !== "undefined" ? !document.hidden : true,
  );

  const activeTimeMsRef = useRef(0);
  const isIdleRef = useRef(false);

  useEffect(() => {
    if (!lessonId || !enabled) {
      return;
    }

    const id = lessonId;
    let flushed = false;

    activeTimeMsRef.current = 0;
    setActiveTimeSeconds(0);
    isIdleRef.current = false;
    setIsIdle(false);
    setIsVisible(!document.hidden);

    let heartbeatIntervalId: number | null = null;
    let idleTimeoutId: number | null = null;
    let lastActivityThrottleAt = 0;

    const stopHeartbeat = (): void => {
      if (heartbeatIntervalId !== null) {
        window.clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }
    };

    const clearIdleTimeout = (): void => {
      if (idleTimeoutId !== null) {
        window.clearTimeout(idleTimeoutId);
        idleTimeoutId = null;
      }
    };

    const sendHeartbeat = (): void => {
      if (document.hidden || isIdleRef.current) {
        return;
      }
      activeTimeMsRef.current += HEARTBEAT_MS;
      setActiveTimeSeconds(Math.floor(activeTimeMsRef.current / 1000));
      void postHeartbeat(id, courseId);
    };

    const startHeartbeat = (): void => {
      stopHeartbeat();
      heartbeatIntervalId = window.setInterval(sendHeartbeat, HEARTBEAT_MS);
    };

    const sendXapiVerb = (verb: "paused" | "resumed"): void => {
      void postXapi(id, verb);
    };

    const enterIdle = (): void => {
      idleTimeoutId = null;
      isIdleRef.current = true;
      setIsIdle(true);
      stopHeartbeat();
    };

    const scheduleIdleTimeout = (): void => {
      clearIdleTimeout();
      idleTimeoutId = window.setTimeout(enterIdle, IDLE_MS);
    };

    const onUserActivity = (): void => {
      const now = Date.now();
      if (now - lastActivityThrottleAt < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivityThrottleAt = now;

      if (isIdleRef.current) {
        isIdleRef.current = false;
        setIsIdle(false);
        if (!document.hidden) {
          startHeartbeat();
        }
      }
      scheduleIdleTimeout();
    };

    const onVisibilityChange = (): void => {
      setIsVisible(!document.hidden);
      if (document.hidden) {
        stopHeartbeat();
        sendXapiVerb("paused");
      } else {
        sendXapiVerb("resumed");
        if (!isIdleRef.current) {
          startHeartbeat();
        }
      }
    };

    const flush = (): void => {
      if (flushed) {
        return;
      }
      flushed = true;
      stopHeartbeat();
      clearIdleTimeout();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove", onUserActivity, PASSIVE);
      window.removeEventListener("keydown", onUserActivity, PASSIVE);
      window.removeEventListener("touchstart", onUserActivity, PASSIVE);
      window.removeEventListener("scroll", onUserActivity, PASSIVE);

      void postSessionComplete(id, courseId, activeTimeMsRef.current);
    };

    window.addEventListener("mousemove", onUserActivity, PASSIVE);
    window.addEventListener("keydown", onUserActivity, PASSIVE);
    window.addEventListener("touchstart", onUserActivity, PASSIVE);
    window.addEventListener("scroll", onUserActivity, PASSIVE);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", flush);

    scheduleIdleTimeout();
    if (!document.hidden) {
      startHeartbeat();
    }

    return () => {
      flush();
    };
  }, [lessonId, enabled, courseId]);

  return { activeTimeSeconds, isIdle, isVisible };
}
