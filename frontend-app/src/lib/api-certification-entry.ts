/**
 * Kandidatski ulaz u certifikaciju — pregled preduvjeta i sheme (GET entry-overview).
 */

import { api } from "@/lib/api";

import type { ApplicationStatus } from "@/lib/api-governance";
import {
  postCertificationDraft,
  type CertificationDraftPayload,
  type CertificationDraftResponse,
} from "@/lib/api-governance";

export type { CertificationDraftPayload, CertificationDraftResponse };
export { postCertificationDraft };

export interface MandatoryDocumentEntry {
  readonly documentType: string;
  readonly description: string;
}

export interface SchemeEntryOverview {
  readonly schemeId: string;
  readonly code: string;
  readonly name: string;
  readonly level: string;
  readonly description: string | null;
  readonly validityMonths: number | string | null;
  readonly mandatoryDocuments: MandatoryDocumentEntry[];
  readonly examSchemeNote: string | null;
  readonly status: string;
  /** Extended by Nest certification entry overview. */
  readonly scopeText?: string;
  readonly prerequisites?: unknown;
  readonly assessmentMethods?: unknown;
  readonly requiredCompetence?: unknown;
  readonly codeOfConduct?: string | null;
}

export interface ExistingApplicationEntry {
  readonly applicationId: string;
  readonly status: ApplicationStatus | string;
  readonly updatedAt: string;
}

/** Sažeti red programa za `/api/certification/candidate-pathways`. */
export interface CertificationPathwaySummary {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly eligible: boolean;
  readonly leadsToCertification: boolean;
  readonly hasPassedExam: boolean;
  readonly hasExamPassCertificate: boolean;
  readonly blockingReasons: readonly string[];
  readonly existingApplication: ExistingApplicationEntry | null;
  readonly entryHref: string;
}

export interface CertificationEntryOverview {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly eligible: boolean;
  readonly leadsToCertification: boolean;
  readonly hasPassedExam: boolean;
  readonly hasExamPassCertificate: boolean;
  readonly blockingReasons: string[];
  readonly scheme: SchemeEntryOverview | null;
  readonly existingApplication: ExistingApplicationEntry | null;
}

/** Polja obrasca prema shemi (GET ``/api/certification/application-requirements/{courseId}``). */
export interface CertificationApplicationRequirements {
  readonly courseId: string;
  readonly certificationSchemeId: string | null;
  readonly requireCv: boolean;
  readonly requireWorkExperience: boolean;
  readonly requireCompetencies: boolean;
  readonly requireReferences: boolean;
  readonly requiredConfirmersCount: number;
  readonly requirePublicEvidenceLinks: boolean;
  readonly requireSupportingDocuments: boolean;
}

export async function fetchPublicCertificationBodyInfo(): Promise<{
  readonly sections: ReadonlyArray<{
    key: string;
    title: string;
    contentUrl: string | null;
    type: string;
  }>;
  readonly generatedAt: string;
}> {
  const { data } = await api.get("/v1/public/certification-body-info");
  return data;
}

export async function fetchCertificationEntryOverview(courseId: string): Promise<CertificationEntryOverview> {
  const id = courseId.trim();
  const { data } = await api.get<CertificationEntryOverview>(
    `/api/certification/entry-overview/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function fetchCandidateCertificationPathways(): Promise<CertificationPathwaySummary[]> {
  const { data } = await api.get<{ readonly pathways?: CertificationPathwaySummary[] }>(
    "/api/certification/candidate-pathways",
  );
  return data.pathways ?? [];
}

export async function fetchCertificationApplicationRequirements(
  courseId: string,
): Promise<CertificationApplicationRequirements> {
  const id = courseId.trim();
  const { data } = await api.get<CertificationApplicationRequirements>(
    `/api/certification/application-requirements/${encodeURIComponent(id)}`,
  );
  return data;
}
