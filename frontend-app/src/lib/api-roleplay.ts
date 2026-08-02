/**
 * AI Roleplay (ISO 17024 simulacija) — REST + SSE preko fetch-a.
 */

import { api, buildApiUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export type RoleplayScenarioItem = {
  readonly scenarioId: string;
  readonly title: string;
  readonly description: string;
  readonly aiPersonaName: string;
  readonly aiPersonaRole: string;
  readonly context: string;
  readonly passingCriteria: string;
  readonly maxAttempts: number;
};

export type RoleplayStartSessionResponse = {
  readonly sessionId: string;
  readonly scenarioId: string;
  readonly status: string;
};

export type RoleplayEvaluateResponse = {
  readonly sessionId: string;
  readonly status: string;
  readonly passed: boolean;
  readonly score: number;
  readonly feedback: string;
};

export type RoleplayTranscriptTurn = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

export async function fetchScenarios(): Promise<RoleplayScenarioItem[]> {
  const { data } = await api.get<RoleplayScenarioItem[]>("/api/roleplay/scenarios");
  return Array.isArray(data) ? data : [];
}

export async function startSession(scenarioId: string): Promise<RoleplayStartSessionResponse> {
  const { data } = await api.post<RoleplayStartSessionResponse>("/api/roleplay/sessions", {
    scenarioId,
  });
  return data;
}

export async function evaluateSession(sessionId: string): Promise<RoleplayEvaluateResponse> {
  const { data } = await api.post<RoleplayEvaluateResponse>(
    `/api/roleplay/sessions/${encodeURIComponent(sessionId)}/evaluate`,
    {},
  );
  return data;
}

/**
 * POST chat → SSE (`data: {"text":"..."}` ili `data: [DONE]`).
 */
export async function streamChatMessage(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError?: (err: Error) => void,
): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  const url = buildApiUrl(`/api/roleplay/sessions/${encodeURIComponent(sessionId)}/chat`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    onError?.(err);
    throw err;
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { detail?: unknown };
      if (typeof j.detail === "string") {
        detail = j.detail;
      }
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    onError?.(err);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    const err = new Error("Stream nije dostupan.");
    onError?.(err);
    throw err;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  const processEventBlock = (block: string): boolean => {
    let doneSignal = false;
    const lines = block.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) {
        continue;
      }
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") {
        doneSignal = true;
        continue;
      }
      try {
        const parsed = JSON.parse(payload) as { text?: string; error?: string };
        if (typeof parsed.error === "string") {
          throw new Error(parsed.error);
        }
        if (typeof parsed.text === "string" && parsed.text.length > 0) {
          onChunk(parsed.text);
        }
      } catch (e) {
        if (e instanceof SyntaxError) {
          continue;
        }
        throw e;
      }
    }
    return doneSignal;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        if (processEventBlock(part)) {
          onComplete();
          return;
        }
      }
    }
    if (buffer.trim()) {
      processEventBlock(buffer);
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }

  onComplete();
}

/** Sprema metapodatke sesije za osvježavanje stranice (samo meta, ne transkript). */
export const ROLEPLAY_META_KEY = (sessionId: string): string => `confora-roleplay-meta-${sessionId}`;

export type RoleplaySessionMeta = {
  readonly scenarioTitle: string;
  readonly aiPersonaName: string;
  readonly aiPersonaRole: string;
  readonly scenarioId: string;
  readonly maxAttempts: number;
};

export function saveRoleplaySessionMeta(sessionId: string, meta: RoleplaySessionMeta): void {
  try {
    sessionStorage.setItem(ROLEPLAY_META_KEY(sessionId), JSON.stringify(meta));
  } catch {
    /* quota / private mode */
  }
}

export function loadRoleplaySessionMeta(sessionId: string): RoleplaySessionMeta | null {
  try {
    const raw = sessionStorage.getItem(ROLEPLAY_META_KEY(sessionId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as RoleplaySessionMeta;
  } catch {
    return null;
  }
}
