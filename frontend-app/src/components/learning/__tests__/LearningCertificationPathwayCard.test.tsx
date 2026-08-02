import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearningCertificationPathwayCard } from "@/components/learning/LearningCertificationPathwayCard";

describe("LearningCertificationPathwayCard", () => {
  it("jasno naznačava razliku exam pass vs PERSON_CERTIFICATION", () => {
    render(
      <LearningCertificationPathwayCard
        completionPercent={40}
        courseCompleted={false}
        hasFinalExam
        leadsToCertification
        quizLessonsTotal={2}
        quizLessonsCompleted={0}
      />,
    );

    expect(screen.getAllByText(/PERSON_CERTIFICATION/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: /Koraci certifikacijskog puta/i })).toBeTruthy();
  });

  it("skraćeni prikaz ako program ne vodi na certifikaciju", () => {
    render(
      <LearningCertificationPathwayCard
        completionPercent={100}
        courseCompleted
        hasFinalExam={false}
        leadsToCertification={false}
        quizLessonsTotal={0}
        quizLessonsCompleted={0}
      />,
    );

    expect(screen.getByText(/nije predviđen shemom/i)).toBeTruthy();
  });
});
