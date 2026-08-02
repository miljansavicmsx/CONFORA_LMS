import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import { PublicCourseCard } from "../PublicCourseCard";
import type { CatalogCourseRow } from "@/lib/lms-learner-api";

const sampleCourse: CatalogCourseRow = {
  id: "course-1",
  title: "ISO 17024 Pilot Programme",
  descriptionPreview: "Uvod u certifikacijske sheme i edukaciju.",
  scope: { id: "scope-1", name: "Management Systems" },
  languages: ["hr"],
  targetAudience: "Profesionalci",
  durationMin: 120,
  previewUrl: null,
  coverImage: null,
  price: { amount: "0", currency: "EUR" },
};

describe("PublicCourseCard", () => {
  it("renders safe public programme data without private fields", () => {
    render(
      <MemoryRouter>
        <PublicCourseCard course={sampleCourse} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("catalog-course-card-course-1")).toBeTruthy();
    expect(screen.getByText("ISO 17024 Pilot Programme")).toBeTruthy();
    expect(screen.getByText(/Edukacijski program/i)).toBeTruthy();
    expect(screen.getByTestId("catalog-view-programme-course-1").getAttribute("href")).toBe(
      "/courses/course-1",
    );
    expect(screen.queryByText(/dossier/i)).toBeNull();
    expect(screen.queryByText(/reviewer/i)).toBeNull();
  });
});
