import { describe, expect, it } from "vitest";

import { createAiTutorSseParser } from "@/lib/ai-tutor-sse";

describe("createAiTutorSseParser", () => {
  it("emituje tekst iz više data linija", () => {
    const p = createAiTutorSseParser();
    const a = p.push('data: {"text":"He"}\n\n');
    expect(a).toEqual([{ kind: "text", text: "He" }]);
    const b = p.push('data: {"text":"llo"}\n\n');
    expect(b).toEqual([{ kind: "text", text: "llo" }]);
  });

  it("parsira grešku i [DONE]", () => {
    const p = createAiTutorSseParser();
    const chunk =
      'data: {"error":"fail"}\n\n' +
      'data: {"text":"x"}\n\n' +
      "data: [DONE]\n\n";
    const ev = p.push(chunk);
    expect(ev).toEqual([
      { kind: "error", message: "fail" },
      { kind: "text", text: "x" },
      { kind: "done" },
    ]);
  });

  it("rascijepa chunk preko granice događaja", () => {
    const p = createAiTutorSseParser();
    const first = p.push('data: {"tex');
    expect(first).toEqual([]);
    const rest = p.push('t":"ab"}\n\n');
    expect(rest).toEqual([{ kind: "text", text: "ab" }]);
  });
});
