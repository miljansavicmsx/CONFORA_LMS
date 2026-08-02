/**
 * Parsiranje SSE tijela za POST /ai-tutor/chat (data: {"text"|"error"} i data: [DONE]).
 */

export type AiTutorSseEvent =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "done" };

export function createAiTutorSseParser(): {
  push(chunk: string): AiTutorSseEvent[];
} {
  let buffer = "";

  function parseEventBlock(block: string): AiTutorSseEvent[] {
    const out: AiTutorSseEvent[] = [];
    for (const line of block.split("\n")) {
      if (!line.startsWith("data:")) {
        continue;
      }
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        out.push({ kind: "done" });
        continue;
      }
      try {
        const j = JSON.parse(payload) as { text?: unknown; error?: unknown };
        if (j.error != null) {
          out.push({ kind: "error", message: String(j.error) });
        }
        if (typeof j.text === "string" && j.text.length > 0) {
          out.push({ kind: "text", text: j.text });
        }
      } catch {
        // preskoči neparsabilne linije
      }
    }
    return out;
  }

  return {
    push(chunk: string): AiTutorSseEvent[] {
      buffer += chunk;
      const events: AiTutorSseEvent[] = [];
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        events.push(...parseEventBlock(block));
      }
      return events;
    },
  };
}
