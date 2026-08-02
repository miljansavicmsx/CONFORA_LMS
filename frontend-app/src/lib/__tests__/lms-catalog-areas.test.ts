import { describe, expect, it } from "vitest";

import type { CourseListRow } from "@/lib/enrich-course-detail";
import { courseMatchesLmsCatalogArea, courseMatchesSearchQuery } from "@/lib/lms-catalog-areas";

function row(partial: Partial<CourseListRow>): CourseListRow {
  return {
    courseId: "c1",
    slug: "s",
    title: partial.title ?? "Kurs",
    domain: partial.domain ?? null,
    categorySlug: partial.categorySlug ?? null,
    price: 0,
    level: "Srednji",
    durationHours: 1,
    thumbnailUrl: null,
    isCertifiable: false,
    ...partial,
  };
}

describe("lms-catalog-areas", () => {
  it("ISO 27001 heuristika radi na naslovu", () => {
    const r = row({ title: "ISO 27001 Lead Implementer" });
    expect(courseMatchesLmsCatalogArea(r, "iso-27001")).toBe(true);
    expect(courseMatchesLmsCatalogArea(r, "iso-9001")).toBe(false);
  });

  it("pretraga pronalazi naziv ili domen", () => {
    const r = row({ title: "Upravljanje rizicima", domain: "Finansije" });
    expect(courseMatchesSearchQuery(r, "rizic")).toBe(true);
    expect(courseMatchesSearchQuery(r, "finans")).toBe(true);
    expect(courseMatchesSearchQuery(r, "27001")).toBe(false);
  });
});
