import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ExamReadinessBanner } from "@/components/learning/ExamReadinessBanner";

/** „Course detail” UX u aplikaciji je OffCanvas (`OffCanvasPanel`). Ovdje testiramo srodni readiness blok. */
describe("Course detail — exam readiness (sastavni dio)", () => {
  it("nudi CTA za ispit kada je program završen i ispit postoji", () => {
    render(
      <MemoryRouter>
        <ExamReadinessBanner
          courseId="c1"
          completionPercent={100}
          mandatoryCompleted={5}
          mandatoryTotal={5}
          courseCompleted
          hasFinalExam
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Pokreni|zahtjev za ispit/i })).toBeTruthy();
  });
});
