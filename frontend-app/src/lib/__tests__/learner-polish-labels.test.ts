import { describe, expect, it } from "vitest";

import {
  credentialKindLabel,
  educationEnrolmentStatusLabel,
  groupCatalogCoursesBySector,
  isEducationEnrolmentCompleted,
  learnerApplicationTimelineLabel,
  resolveCatalogSector,
  shouldShowPublicVerifyLink,
  LEARNER_CERT_APPLICATION_EMPTY,
} from "@/lib/learner-polish-labels";
import type { CatalogCourseRow } from "@/lib/lms-learner-api";
import type { EducationEnrolment } from "@/lib/learner-education-api";
import { statusLabelHr } from "@/lib/candidate-certification";

const sampleCourse = (title: string, scopeName: string): CatalogCourseRow => ({
  id: "c1",
  title,
  descriptionPreview: "desc",
  scope: { id: "s1", name: scopeName },
  languages: ["hr"],
  targetAudience: null,
  durationMin: 120,
  previewUrl: null,
  coverImage: null,
  price: { amount: "0", currency: "EUR" },
});

describe("LEARNER-POLISH-2 learner-polish-labels", () => {
  it("maps learner application timeline labels without internal enums", () => {
    expect(learnerApplicationTimelineLabel("SUBMITTED")).toBe("Podneseno");
    expect(learnerApplicationTimelineLabel("UNDER_REVIEW")).toBe("U pregledu");
    expect(learnerApplicationTimelineLabel("RETURNED_FOR_MORE_INFO")).toBe("Vraćeno za dopunu");
  });

  it("maps statusLabelHr SUBMITTED to Podneseno", () => {
    expect(statusLabelHr("SUBMITTED")).toBe("Podneseno");
  });

  it("maps credential kind enums to user-facing labels", () => {
    expect(credentialKindLabel("EXAM_PASS_CERTIFICATE")).toBe("Potvrda o položenom ispitu");
    expect(credentialKindLabel("PERSON_CERTIFICATION")).toBe("Profesionalni certifikat osobe");
  });

  it("filters active vs completed education enrolments", () => {
    const active: EducationEnrolment = {
      id: "1",
      courseId: "c",
      courseTitle: "A",
      enrolmentStatus: "ACTIVE",
      progressStatus: "IN_PROGRESS",
      progressPct: 40,
      enrolledAt: "2026-01-01",
      completedAt: null,
      evidence: null,
    };
    const done: EducationEnrolment = {
      ...active,
      id: "2",
      enrolmentStatus: "COMPLETED",
      progressStatus: "COMPLETED",
      progressPct: 100,
      completedAt: "2026-06-01",
    };
    expect(isEducationEnrolmentCompleted(active)).toBe(false);
    expect(isEducationEnrolmentCompleted(done)).toBe(true);
    expect(educationEnrolmentStatusLabel("ENROLLED")).toBe("Upisan");
  });

  it("groups catalog courses by sector fallback", () => {
    const groups = groupCatalogCoursesBySector([
      sampleCourse("ISO 27001", "Informaciona bezbjednost"),
      sampleCourse("Opšte", "General"),
    ]);
    expect(groups.length).toBeGreaterThan(0);
    expect(resolveCatalogSector(sampleCourse("ISO 27001", "Security"))).toBe("Informaciona bezbjednost");
  });

  it("shows public verify link only for active/issued certificates", () => {
    expect(shouldShowPublicVerifyLink("ACTIVE")).toBe(true);
    expect(shouldShowPublicVerifyLink("DRAFT")).toBe(false);
  });

  it("learner support empty copy is defined", () => {
    expect(LEARNER_CERT_APPLICATION_EMPTY).toContain("certifikaciju");
  });
});
