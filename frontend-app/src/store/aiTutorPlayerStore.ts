import { create } from "zustand";

import { streamAiTutorChat } from "@/lib/ai-tutor-stream";
import { useAuthStore } from "@/stores/authStore";

export type AiTutorMessageRole = "user" | "assistant";

export interface AiTutorMessage {
  readonly id: string;
  readonly role: AiTutorMessageRole;
  readonly text: string;
  /** Asistent odgovori generisani modelom (oznaka za governance). */
  readonly aiGenerated?: boolean;
}

export interface AiTutorPlayerContext {
  readonly courseId: string;
  readonly moduleId: string;
  readonly lessonId: string | null;
  readonly lessonTitle: string | null;
  readonly moduleTitle: string | null;
}

export interface AiTutorPlayerState {
  readonly panelOpen: boolean;
  readonly hasUnread: boolean;
  readonly messages: readonly AiTutorMessage[];
  readonly isTyping: boolean;
  readonly lastError: string | null;
  readonly sessionId: string | null;
  readonly playerContext: AiTutorPlayerContext | null;

  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  clearUnread: () => void;
  setPlayerContext: (ctx: AiTutorPlayerContext | null) => void;
  sendMessage: (text: string, options?: { retry?: boolean }) => Promise<void>;
  retryLastMessage: () => void;
  resetConversation: () => void;
  abortStream: () => void;
}

let msgId = 0;
function nextId(): string {
  msgId += 1;
  return `ai-${msgId}`;
}

let streamAbort: AbortController | null = null;

export const useAiTutorPlayerStore = create<AiTutorPlayerState>((set, get) => ({
  panelOpen: false,
  hasUnread: false,
  messages: [],
  isTyping: false,
  lastError: null,
  sessionId: null,
  playerContext: null,

  openPanel: () => set({ panelOpen: true, hasUnread: false }),

  closePanel: () => set({ panelOpen: false }),

  togglePanel: () =>
    set((s) => ({
      panelOpen: !s.panelOpen,
      hasUnread: !s.panelOpen ? false : s.hasUnread,
    })),

  clearUnread: () => set({ hasUnread: false }),

  setPlayerContext: (ctx) => set({ playerContext: ctx }),

  abortStream: () => {
    streamAbort?.abort();
    streamAbort = null;
  },

  resetConversation: () => {
    streamAbort?.abort();
    streamAbort = null;
    set({
      messages: [],
      isTyping: false,
      hasUnread: false,
      lastError: null,
      sessionId: null,
    });
  },

  retryLastMessage: () => {
    const { lastError, messages } = get();
    if (!lastError) {
      return;
    }
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") {
      return;
    }
    void get().sendMessage(last.text, { retry: true });
  },

  sendMessage: async (text: string, options?: { retry?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const ctx = get().playerContext;
    if (!ctx?.courseId || !ctx.moduleId) {
      set({
        lastError: "Nema konteksta lekcije — pričekajte učitavanje kursa.",
      });
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ lastError: "Prijavite se da biste koristili AI Tutora." });
      return;
    }

    streamAbort?.abort();
    streamAbort = new AbortController();
    const signal = streamAbort.signal;

    let priorForApi: readonly AiTutorMessage[];

    if (options?.retry) {
      const msgs = get().messages;
      const last = msgs[msgs.length - 1];
      if (!last || last.role !== "user" || last.text !== trimmed) {
        return;
      }
      priorForApi = msgs.slice(0, -1);
      const asst: AiTutorMessage = {
        id: nextId(),
        role: "assistant",
        text: "",
        aiGenerated: true,
      };
      set({
        messages: [...msgs, asst],
        isTyping: true,
        lastError: null,
        hasUnread: false,
      });
    } else {
      priorForApi = get().messages;
      const userMsg: AiTutorMessage = {
        id: nextId(),
        role: "user",
        text: trimmed,
      };
      const asst: AiTutorMessage = {
        id: nextId(),
        role: "assistant",
        text: "",
        aiGenerated: true,
      };
      set({
        messages: [...priorForApi, userMsg, asst],
        isTyping: true,
        lastError: null,
        hasUnread: false,
      });
    }

    const history = priorForApi.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    const stripFailedAssistant = () => {
      set((s) => {
        const msgs = [...s.messages];
        if (msgs[msgs.length - 1]?.role === "assistant") {
          msgs.pop();
        }
        return { messages: msgs, isTyping: false };
      });
    };

    try {
      await streamAiTutorChat(
        {
          message: trimmed,
          context: {
            courseId: ctx.courseId,
            moduleId: ctx.moduleId,
            lessonId: ctx.lessonId,
            lessonTitle: ctx.lessonTitle,
            triggerType: "user_initiated",
          },
          history,
          sessionId: get().sessionId,
        },
        signal,
        {
          onSessionId: (sid) => {
            if (!signal.aborted) {
              set({ sessionId: sid });
            }
          },
          onEvent: (ev) => {
            if (signal.aborted) {
              return;
            }
            if (ev.kind === "text") {
              set((s) => {
                const msgs = [...s.messages];
                const last = msgs[msgs.length - 1];
                if (last?.role === "assistant") {
                  msgs[msgs.length - 1] = {
                    ...last,
                    text: last.text + ev.text,
                  };
                }
                return { messages: msgs };
              });
            } else if (ev.kind === "error") {
              stripFailedAssistant();
              set({ lastError: ev.message });
            }
          },
        },
      );
      if (!signal.aborted) {
        set((s) => ({
          isTyping: false,
          hasUnread: s.lastError ? false : !s.panelOpen,
        }));
      }
    } catch (e) {
      if (signal.aborted) {
        return;
      }
      const errMsg = e instanceof Error ? e.message : "Nepoznata greška";
      stripFailedAssistant();
      set({ lastError: errMsg });
    } finally {
      if (!signal.aborted) {
        streamAbort = null;
      }
    }
  },
}));
