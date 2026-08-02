import { buildApiUrl } from "@/lib/api-base-url";
import { refreshAccessToken } from "@/lib/auth-refresh";
import { useAuthStore } from "@/stores/authStore";

import { createAiTutorSseParser, type AiTutorSseEvent } from "@/lib/ai-tutor-sse";

export interface AiTutorChatRequestBody {
  readonly message: string;
  readonly context: {
    readonly courseId: string;
    readonly moduleId: string;
    readonly lessonId?: string | null;
    readonly lessonTitle?: string | null;
    readonly triggerType?: "quiz_failed" | "user_initiated" | "idle" | "exam_failed" | null;
  };
  readonly history: readonly { readonly role: "user" | "assistant"; readonly content: string }[];
  readonly sessionId?: string | null;
}

async function fetchWithAuth(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const headers = new Headers(init.headers);
  let token = useAuthStore.getState().accessToken;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const run = () =>
    fetch(url, {
      ...init,
      headers,
    });

  let res = await run();
  if (res.status !== 401) {
    return res;
  }

  const refresh = useAuthStore.getState().refreshToken;
  if (!refresh) {
    useAuthStore.getState().logout();
    return res;
  }

  try {
    const next = await refreshAccessToken(refresh);
    useAuthStore.getState().setAccessToken(next);
    headers.set("Authorization", `Bearer ${next}`);
    res = await run();
  } catch {
    useAuthStore.getState().logout();
  }
  return res;
}

/**
 * POST /ai-tutor/chat — SSE stream; poziva onEvent za svaki token/grešku/kraj.
 */
export async function streamAiTutorChat(
  body: AiTutorChatRequestBody,
  signal: AbortSignal,
  options: {
    readonly onEvent: (ev: AiTutorSseEvent) => void;
    readonly onSessionId?: (sessionId: string) => void;
  },
): Promise<void> {
  const url = buildApiUrl("/ai-tutor/chat");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: body.message,
      context: {
        courseId: body.context.courseId,
        moduleId: body.context.moduleId,
        ...(body.context.lessonId ? { lessonId: body.context.lessonId } : {}),
        ...(body.context.lessonTitle ? { lessonTitle: body.context.lessonTitle } : {}),
        ...(body.context.triggerType ? { triggerType: body.context.triggerType } : {}),
      },
      history: [...body.history],
      ...(body.sessionId ? { sessionId: body.sessionId } : {}),
    }),
    signal,
  });

  const sid = res.headers.get("X-AI-Tutor-Session-Id");
  if (sid && options.onSessionId) {
    options.onSessionId(sid);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { detail?: unknown };
      if (j.detail != null) {
        detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
      }
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
    }
    options.onEvent({ kind: "error", message: detail || `HTTP ${res.status}` });
    return;
  }

  if (!res.body) {
    options.onEvent({ kind: "error", message: "Prazan odgovor streama." });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const parser = createAiTutorSseParser();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      const events = parser.push(chunk);
      for (const ev of events) {
        options.onEvent(ev);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
