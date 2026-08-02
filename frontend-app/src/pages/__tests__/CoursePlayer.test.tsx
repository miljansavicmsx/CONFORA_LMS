import { describe, expect, it } from "vitest";

import CoursePlayer from "@/pages/CoursePlayer";

describe("CoursePlayer", () => {
  it("exportira komponentu", () => {
    expect(CoursePlayer).toBeTypeOf("function");
  });
});
