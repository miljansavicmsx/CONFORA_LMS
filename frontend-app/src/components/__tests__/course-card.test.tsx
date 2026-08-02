import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CourseCard } from "@/components/CourseCard";

const baseProps = {
  courseId: "course-1",
  title: "ISO 27001 Foundation",
  slug: "iso-27001-foundation",
  thumbnailUrl: "https://example.com/course.jpg",
  domain: "Informacijska sigurnost",
  level: "Pocetni" as const,
  durationHours: 12,
  modulesCount: 4,
  price: 0,
  currency: "EUR",
  pathwayTier: "education_exam_pass_and_certification" as const,
  catalogStatus: "published",
  hasFinalExam: true,
  onClick: vi.fn(),
};

describe("CourseCard", () => {
  it("shows details and add/continue action buttons", () => {
    const onDetails = vi.fn();
    const onPrimary = vi.fn();

    render(
      <CourseCard
        {...baseProps}
        ctaLabel="Dodaj kurs"
        secondaryCtaLabel="Detalji"
        onClick={onDetails}
        onPrimaryAction={onPrimary}
      />,
    );

    expect(screen.getByRole("button", { name: /Detalji/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Dodaj kurs/i }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onDetails).not.toHaveBeenCalled();
  });

  it("renders enrolled progress and continue label", () => {
    render(
      <CourseCard
        {...baseProps}
        enrolledAt="2026-01-01T00:00:00Z"
        progressPct={48}
        ctaLabel="Nastavi učenje"
      />,
    );

    expect(screen.getByRole("progressbar", { name: /48 posto/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Nastavi učenje/i })).toBeTruthy();
  });
});
