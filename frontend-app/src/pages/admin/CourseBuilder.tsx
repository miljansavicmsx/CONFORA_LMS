"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { TRAINING_DOMAINS } from "@/admin/constants/training-domains";
import { certificateConfigToWire, defaultCertificateConfig } from "@/admin/content-editor/curriculum-io";
import { useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import { step1DefaultValues, type Step1BasicInfoFormValues } from "@/admin/schemas/step1BasicInfoSchema";
import { CourseBuilderCurriculumTab } from "@/pages/admin/CourseBuilderCurriculumTab";
import { fetchCertificationSchemeOptions } from "@/lib/admin-certification-scheme-options-api";
import { postTechnicalCommitteeValidation } from "@/lib/admin-course-technical-validation-api";
import {
  fetchAccessibilityReadiness,
  type CourseAccessibilitySummary,
} from "@/lib/admin-course-a11y-api";
import { AccessibilityReadinessWidget } from "@/admin/content-editor/components/AccessibilityReadinessWidget";
import { createAdminCourse } from "@/lib/admin-course-create-api";
import { patchAdminCourse } from "@/lib/admin-course-patch-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
type BuilderTab = "general" | "curriculum" | "exam" | "certificate" | "certification" | "publish";

const BUILDER_TAB_VALUES: readonly BuilderTab[] = [
  "general",
  "curriculum",
  "exam",
  "certificate",
  "certification",
  "publish",
] as const;

function parseCertificationLevelsText(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function buildMinimalCreatePayload(): Step1BasicInfoFormValues {
  const desc =
    "<p>" +
    "CONFORA obuka — detaljan opis koji zadovoljava minimalnu duljinu validacije za kreiranje kursa. ".repeat(
      3,
    ) +
    "</p>";
  return {
    ...step1DefaultValues,
    name: "Nova CONFORA obuka",
    slug: `nova-obuka-${Date.now().toString(36)}`,
    domains: [TRAINING_DOMAINS[0]],
    subtitle: "Podnaslov obuke",
    description: desc,
    learningGoals: ["Cilj učenja 1", "Cilj učenja 2", "Cilj učenja 3"],
    certificationType: "none",
  };
}

export default function CourseBuilder(): JSX.Element {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const courseId = params.get("courseId")?.trim() || "";
  const tabQuery = params.get("tab")?.trim().toLowerCase() ?? "";

  const [tab, setTab] = useState<BuilderTab>("general");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const courseMeta = useContentEditorStore((s) => s.courseMeta);
  const storeTitle = useContentEditorStore((s) => s.courseTitle);
  const curriculumReady = useContentEditorStore((s) => s.curriculumLoadStatus === "ready");
  const setCourseTitle = useContentEditorStore((s) => s.setCourseTitle);
  const loadCurriculum = useContentEditorStore((s) => s.loadCurriculum);
  const certificateConfig = useContentEditorStore((s) => s.certificateConfig);
  const patchCertificateConfig = useContentEditorStore((s) => s.patchCertificateConfig);
  const examConfig = useContentEditorStore((s) => s.examConfig);
  const patchExamConfig = useContentEditorStore((s) => s.patchExamConfig);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<string>(TRAINING_DOMAINS[0]);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const [thumbDataUrl, setThumbDataUrl] = useState("");
  const [certRequired, setCertRequired] = useState(true);
  const [leadsToCertification, setLeadsToCertification] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [autoIssueExamPass, setAutoIssueExamPass] = useState(true);
  const [certSchemeRef, setCertSchemeRef] = useState("");
  const [certLevelsText, setCertLevelsText] = useState("");
  const [committeeDecisionRequired, setCommitteeDecisionRequired] = useState(true);
  const [recertificationMonths, setRecertificationMonths] = useState<number | "">("");
  const [schemeOptions, setSchemeOptions] = useState<{ schemeId: string; code: string; name: string }[]>([]);
  const [validationNotesDraft, setValidationNotesDraft] = useState("");
  const [a11ySummary, setA11ySummary] = useState<CourseAccessibilitySummary | null>(null);
  const [a11yLoading, setA11yLoading] = useState(false);
  const [a11yError, setA11yError] = useState<string | null>(null);
  const [listing, setListing] = useState<"public" | "private">("private");
  const [pdfUploadTarget, setPdfUploadTarget] = useState<"legacy" | "exam_pass" | "person_certification">("legacy");

  useEffect(() => {
    const t = BUILDER_TAB_VALUES.find((x) => x === tabQuery);
    if (t) {
      setTab(t);
    }
  }, [tabQuery]);

  useEffect(() => {
    if (!courseId) {
      return;
    }
    void loadCurriculum(courseId);
  }, [courseId, loadCurriculum]);

  useEffect(() => {
    if (!courseId || tab !== "publish") {
      return;
    }
    let cancelled = false;
    setA11yLoading(true);
    setA11yError(null);
    void fetchAccessibilityReadiness(courseId)
      .then((s) => {
        if (!cancelled) {
          setA11ySummary(s);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setA11ySummary(null);
          setA11yError(e instanceof Error ? e.message : "Accessibility summary unavailable");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setA11yLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, tab, curriculumReady]);

  useEffect(() => {
    if (!courseId || tab !== "certification") {
      return;
    }
    let cancelled = false;
    void fetchCertificationSchemeOptions(courseId)
      .then((items) => {
        if (!cancelled) {
          setSchemeOptions(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSchemeOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, tab]);

  useEffect(() => {
    if (curriculumReady && courseId && storeTitle.trim()) {
      setTitle(storeTitle.trim());
    }
  }, [curriculumReady, courseId, storeTitle]);

  useEffect(() => {
    if (!courseMeta) {
      return;
    }
    setDomain(courseMeta.domain ?? TRAINING_DOMAINS[0]);
    setPrice(Number(courseMeta.price) || 0);
    setCurrency(courseMeta.currency ?? "EUR");
    setCertRequired(courseMeta.isCertifiable !== false);
    setLeadsToCertification(courseMeta.leadsToCertification !== false);
    setSubtitle(courseMeta.subtitle ?? "");
    setDescription(courseMeta.description ?? "");
    setLearningGoals(
      courseMeta.learningGoals?.length ? [...courseMeta.learningGoals] : [],
    );
    setAutoIssueExamPass(courseMeta.autoIssueExamPassCertificate !== false);
    setCertSchemeRef(courseMeta.certificationSchemeReference ?? "");
    setCertLevelsText((courseMeta.certificationLevelsEnabled ?? []).join(", "));
    setCommitteeDecisionRequired(courseMeta.committeeDecisionRequired !== false);
    const rc = courseMeta.courseRecertificationCycleMonths;
    setRecertificationMonths(rc !== undefined && rc !== null ? Number(rc) : "");
    setListing(courseMeta.status === "published" ? "public" : "private");
  }, [courseMeta]);

  const handleSaveGeneral = useCallback(async () => {
    if (!courseId) {
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await patchAdminCourse(courseId, {
        title: title.trim(),
        domain: domain.trim(),
        price,
        currency,
        isCertifiable: certRequired,
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        learningGoals,
        status: listing === "public" ? "published" : "draft",
        ...(thumbDataUrl.trim() ? { thumbnailDataUrl: thumbDataUrl.trim() } : {}),
      });
      setCourseTitle(title.trim());
      await loadCurriculum(courseId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Spremanje nije uspjelo.");
    } finally {
      setSaving(false);
    }
  }, [
    courseId,
    title,
    domain,
    price,
    currency,
    certRequired,
    subtitle,
    description,
    learningGoals,
    listing,
    thumbDataUrl,
    setCourseTitle,
    loadCurriculum,
  ]);

  const handleSaveCertificateTab = useCallback(async () => {
    if (!courseId) {
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await patchAdminCourse(courseId, {
        certificateConfig: certificateConfigToWire(certificateConfig),
        autoIssueExamPassCertificate: autoIssueExamPass,
      });
      await loadCurriculum(courseId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Spremanje nije uspjelo.");
    } finally {
      setSaving(false);
    }
  }, [courseId, certificateConfig, autoIssueExamPass, loadCurriculum]);

  const handleSaveExamTab = useCallback(async () => {
    if (!courseId) {
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await patchAdminCourse(courseId, {
        examQuestionCount: examConfig.questionsCount,
        passingScorePct: examConfig.passingScorePct,
        examAttemptsAllowed: examConfig.attemptsAllowed,
        examTimeLimitMinutes: examConfig.durationMinutes,
        examCooldownHours: examConfig.cooldownHours,
        hasFinalExam: examConfig.hasFinalExam,
        examIdentityCheckRequired: examConfig.identityCheckRequired,
        examRequireMfa: examConfig.requireMfa,
        examRandomOrder: examConfig.randomOrder,
        examShowResults: examConfig.showResults,
      });
      await loadCurriculum(courseId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Spremanje nije uspjelo.");
    } finally {
      setSaving(false);
    }
  }, [courseId, examConfig, loadCurriculum]);

  const handleSaveCertificationTab = useCallback(async () => {
    if (!courseId) {
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      const levels = parseCertificationLevelsText(certLevelsText);
      await patchAdminCourse(courseId, {
        leadsToCertification,
        certificationSchemeReference: certSchemeRef.trim() || undefined,
        certificationLevelsEnabled: levels,
        committeeDecisionRequired,
        courseRecertificationCycleMonths:
          recertificationMonths === "" ? undefined : Math.max(1, Math.min(600, Number(recertificationMonths))),
      });
      await loadCurriculum(courseId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Spremanje nije uspjelo.");
    } finally {
      setSaving(false);
    }
  }, [
    courseId,
    leadsToCertification,
    certSchemeRef,
    certLevelsText,
    committeeDecisionRequired,
    recertificationMonths,
    loadCurriculum,
  ]);

  const onCreateDraft = useCallback(async () => {
    setCreating(true);
    setErr(null);
    try {
      const raw = buildMinimalCreatePayload();
      const { courseId: cid } = await createAdminCourse(raw);
      navigate(`/dashboard/admin/kreiraj-kurs?courseId=${encodeURIComponent(cid)}`, { replace: true });
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      setErr(typeof msg === "string" ? msg : "Kreiranje nije uspjelo.");
    } finally {
      setCreating(false);
    }
  }, [navigate]);

  const onPdfRead = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const s = typeof reader.result === "string" ? reader.result : "";
        if (!s.startsWith("data:application/pdf")) {
          setErr("Odaberite PDF datoteku.");
          return;
        }
        void (async () => {
          try {
            if (!courseId) {
              return;
            }
            await patchAdminCourse(courseId, {
              certificateTemplateDataUrl: s,
              certificateTemplateUploadTarget: pdfUploadTarget,
            });
            await loadCurriculum(courseId);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Upload nije uspio.");
          }
        })();
      };
      reader.readAsDataURL(file);
    },
    [courseId, loadCurriculum, pdfUploadTarget],
  );

  if (!courseId) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10 text-text-primary">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kreiranje obuke</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Nema odabranog kursa. Kreirajte nacrt obuke — zatim ćete učitati podatke za sve kartice.
          </p>
        </div>
        <Card className="border-border/50 bg-surface-secondary/60">
          <CardHeader>
            <CardTitle className="text-base">Novi nacrt</CardTitle>
            <CardDescription>
              Kreira se kurs u statusu „draft” s minimalnim validnim podacima; uredićete u builderu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="w-full bg-brand text-white hover:bg-brand/90"
              disabled={creating}
              onClick={() => void onCreateDraft()}
            >
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kreiraj nacrt obuke
            </Button>
          </CardContent>
        </Card>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 text-text-primary md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kreiranje obuke</h1>
          <p className="mt-1 text-sm text-text-secondary">
            <span className="font-mono text-text-muted">{courseId}</span>
            {storeTitle.trim() ? (
              <>
                {" "}
                ·
                {storeTitle.trim()}
              </>
            ) : null}
          </p>
        </div>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </p>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as BuilderTab)}
        className="space-y-6"
      >
        <TabsList className="flex h-auto flex-wrap gap-1 border border-border/40 bg-surface-secondary/80 p-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Opšti dio
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Kurikulum
          </TabsTrigger>
          <TabsTrigger value="exam" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Ispit
          </TabsTrigger>
          <TabsTrigger value="certificate" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Certifikat
          </TabsTrigger>
          <TabsTrigger value="certification" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Cert. put
          </TabsTrigger>
          <TabsTrigger value="publish" className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand">
            Objava
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Osnovne informacije</CardTitle>
              <CardDescription>Područje, cijena, vidljivost i slika za obuku.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-title">Naziv obuke</Label>
                <Input
                  id="cb-title"
                  value={title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTitle(v);
                    setCourseTitle(v);
                  }}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-subtitle">Podnaslov</Label>
                <Input
                  id="cb-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-desc">Opis (HTML ili običan tekst)</Label>
                <textarea
                  id="cb-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-border/40 bg-surface-primary px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Ishodi učenja (do 10)</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    disabled={learningGoals.length >= 10}
                    onClick={() => setLearningGoals((g) => [...g, ""])}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Dodaj
                  </Button>
                </div>
                <div className="space-y-2">
                  {learningGoals.map((g, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={g}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLearningGoals((prev) => prev.map((x, i) => (i === idx ? v : x)));
                        }}
                        placeholder={`Ishod ${idx + 1}`}
                        className="border-border/40 bg-surface-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-red-400 hover:text-red-300"
                        onClick={() => setLearningGoals((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label="Ukloni ishod"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {!learningGoals.length ? (
                    <p className="text-xs text-text-muted">Nema ishoda — dodajte jedan ili više redaka.</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb-domain">Područje obuke</Label>
                <select
                  id="cb-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border/40 bg-surface-primary px-3 text-sm"
                >
                  {TRAINING_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb-price">Cijena</Label>
                <div className="flex gap-2">
                  <Input
                    id="cb-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="border-border/40 bg-surface-primary"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-28 rounded-md border border-border/40 bg-surface-primary px-2 text-sm"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="BAM">BAM</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Slika za obuku (thumbnail)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="border-border/40 bg-surface-primary"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) {
                      return;
                    }
                    const r = new FileReader();
                    r.onload = () => setThumbDataUrl(typeof r.result === "string" ? r.result : "");
                    r.readAsDataURL(f);
                  }}
                />
                {thumbDataUrl ? (
                  <img src={thumbDataUrl} alt="" className="mt-2 max-h-36 rounded-md border border-border/40" />
                ) : null}
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Checkbox
                  id="cb-cert"
                  checked={certRequired}
                  onCheckedChange={(c) => setCertRequired(c === true)}
                />
                <Label htmlFor="cb-cert" className="cursor-pointer font-normal">
                  Obuka zahtijeva certifikaciju
                </Label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-listing">Status obuke</Label>
                <select
                  id="cb-listing"
                  value={listing}
                  onChange={(e) => setListing(e.target.value as "public" | "private")}
                  className="flex h-10 max-w-md rounded-md border border-border/40 bg-surface-primary px-3 text-sm"
                >
                  <option value="public">Javno dostupna (objavljena)</option>
                  <option value="private">Nije dostupna (nacrt)</option>
                </select>
              </div>
            </CardContent>
          </Card>
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={saving}
            onClick={() => void handleSaveGeneral()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Spremi opšti dio
          </Button>
        </TabsContent>

        <TabsContent value="curriculum" className="outline-none">
          <p className="mb-3 text-sm text-text-secondary">
            Poglavlja (moduli) i tačke (lekcije): tekst, video, PDF ili testni kviz na kraju modula. Procijenjeno
            trajanje u desnom panelu.
          </p>
          <CourseBuilderCurriculumTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="certificate" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Izdavanje nakon položenog ispita</CardTitle>
              <CardDescription>
                Automatsko generiranje potvrde, prefiks broja dokumenta i QR mapiranje u odjeljku ispod.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={autoIssueExamPass}
                  onCheckedChange={(c) => setAutoIssueExamPass(c === true)}
                />
                Automatski izdaj potvrdu (exam pass) nakon uspješnog ispita
              </label>
              <div className="space-y-2">
                <Label htmlFor="cb-cert-prefix">Prefiks broja certifikata</Label>
                <Input
                  id="cb-cert-prefix"
                  value={certificateConfig.certificateNumberPrefix}
                  onChange={(e) => patchCertificateConfig({ certificateNumberPrefix: e.target.value })}
                  placeholder="npr. ISO27 (prazno = CON)"
                  maxLength={12}
                  className="max-w-md border-border/40 bg-surface-primary font-mono text-sm"
                />
                <p className="text-xs text-text-muted">Najviše 12 znakova; sinkronizira se s generatorom ID-a potvrde.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Javna verifikacija i učitavanje PDF šablona</CardTitle>
              <CardDescription>
                Dva obitelji šablona: potvrda o položenom ispitu (exam pass) i certifikat osobe (person certification).
                Naslijeđeni URL koristi se kao fallback ako zasebni dizajner nema vlastiti šablon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Baza URL-a za QR (override)</Label>
                <Input
                  value={certificateConfig.verificationBaseUrl}
                  onChange={(e) => patchCertificateConfig({ verificationBaseUrl: e.target.value })}
                  placeholder="npr. https://portal.confora.io/verify"
                  className="border-border/40 bg-surface-primary font-mono text-sm"
                />
                <p className="text-xs text-text-muted">
                  Prazno = vrijednost iz okruženja (CERTIFICATE_VERIFY_BASE_URL). Na potvrdu se dodaje /{"{"}certId{"}"}.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Odredište učitanog PDF-a</Label>
                <select
                  value={pdfUploadTarget}
                  onChange={(e) =>
                    setPdfUploadTarget(e.target.value as "legacy" | "exam_pass" | "person_certification")
                  }
                  className="mt-1 w-full rounded-md border border-border/40 bg-surface-primary px-3 py-2 text-sm"
                >
                  <option value="legacy">Naslijeđeni (fallback) — certificateTemplatePdfUrl</option>
                  <option value="exam_pass">Exam pass dizajner</option>
                  <option value="person_certification">Osobna certifikacija dizajner</option>
                </select>
              </div>
              <div>
                <Label>Učitaj PDF (AcroForm)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  className="mt-1 border-border/40 bg-surface-primary"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      onPdfRead(f);
                    }
                  }}
                />
                <div className="mt-2 space-y-1 text-xs text-text-muted">
                  {certificateConfig.certificateTemplatePdfUrl ? (
                    <p>Naslijeđeni URL: {certificateConfig.certificateTemplatePdfUrl.slice(0, 96)}…</p>
                  ) : null}
                  {certificateConfig.examPassCertificateDesigner.certificateTemplatePdfUrl ? (
                    <p>
                      Exam pass URL:{" "}
                      {certificateConfig.examPassCertificateDesigner.certificateTemplatePdfUrl.slice(0, 96)}…
                    </p>
                  ) : null}
                  {certificateConfig.personCertificationCertificateDesigner.certificateTemplatePdfUrl ? (
                    <p>
                      Osobna cert. URL:{" "}
                      {certificateConfig.personCertificationCertificateDesigner.certificateTemplatePdfUrl.slice(
                        0,
                        96,
                      )}
                      …
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Naslijeđeno mapiranje (opcionalni fallback)</CardTitle>
              <CardDescription>
                Polja za jedinstveni šablon; exam/osobna certifikacija nasljeđuju nepopunjena imena odavde.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Ime i prezime", "fullName", certificateConfig.pdfFieldMapping.fullName],
                  ["Naziv obuke", "courseName", certificateConfig.pdfFieldMapping.courseName],
                  ["Broj certifikata", "certificateNumber", certificateConfig.pdfFieldMapping.certificateNumber],
                  ["QR kod", "qrCode", certificateConfig.pdfFieldMapping.qrCode],
                  ["Datum izdavanja", "issuedAt", certificateConfig.pdfFieldMapping.issuedAt],
                  ["Datum isteka", "expiresAt", certificateConfig.pdfFieldMapping.expiresAt],
                ] as const
              ).map(([label, fk, val]) => (
                <div key={fk} className="space-y-1">
                  <Label className="text-xs text-text-muted">{label} (ime PDF polja)</Label>
                  <Input
                    value={val}
                    onChange={(e) => {
                      const v = e.target.value;
                      const pm = certificateConfig.pdfFieldMapping;
                      const next =
                        fk === "fullName"
                          ? { ...pm, fullName: v }
                          : fk === "courseName"
                            ? { ...pm, courseName: v }
                            : fk === "certificateNumber"
                              ? { ...pm, certificateNumber: v }
                              : fk === "qrCode"
                                ? { ...pm, qrCode: v }
                                : fk === "issuedAt"
                                  ? { ...pm, issuedAt: v }
                                  : { ...pm, expiresAt: v };
                      patchCertificateConfig({ pdfFieldMapping: next });
                    }}
                    className="border-border/40 bg-surface-primary"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Exam pass — mapiranje polja</CardTitle>
              <CardDescription>
                Naslov dokumenta, kandidat, obuka, datum ispita, izdavanja, rezultat (ako je uključen), broj, QR, hash
                potpisa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={certificateConfig.examPassCertificateDesigner.includeScore}
                  onCheckedChange={(c) =>
                    patchCertificateConfig({
                      examPassCertificateDesigner: {
                        ...certificateConfig.examPassCertificateDesigner,
                        includeScore: Boolean(c),
                      },
                    })
                  }
                />
                Prikaži rezultat ispita na PDF-u
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Naslov dokumenta", "documentTitle"],
                    ["Ime i prezime", "fullName"],
                    ["Naziv obuke", "courseName"],
                    ["Datum ispita", "examDate"],
                    ["Datum izdavanja", "issueDate"],
                    ["Rezultat (bodovi)", "score"],
                    ["Broj dokumenta", "certificateNumber"],
                    ["QR / verifikacija", "qrCode"],
                    ["Digitalni otisak (hash)", "digitalSignatureHash"],
                  ] as const
                ).map(([label, fk]) => {
                  const pm = certificateConfig.examPassCertificateDesigner.pdfFieldMapping;
                  const val =
                    fk === "documentTitle"
                      ? pm.documentTitle
                      : fk === "fullName"
                        ? pm.fullName
                        : fk === "courseName"
                          ? pm.courseName
                          : fk === "examDate"
                            ? pm.examDate
                            : fk === "issueDate"
                              ? pm.issueDate
                              : fk === "score"
                                ? pm.score
                                : fk === "certificateNumber"
                                  ? pm.certificateNumber
                                  : fk === "qrCode"
                                    ? pm.qrCode
                                    : pm.digitalSignatureHash;
                  return (
                    <div key={fk} className="space-y-1">
                      <Label className="text-xs text-text-muted">{label}</Label>
                      <Input
                        value={val}
                        onChange={(e) => {
                          const v = e.target.value;
                          const base = certificateConfig.examPassCertificateDesigner.pdfFieldMapping;
                          patchCertificateConfig({
                            examPassCertificateDesigner: {
                              ...certificateConfig.examPassCertificateDesigner,
                              pdfFieldMapping: { ...base, [fk]: v },
                            },
                          });
                        }}
                        className="border-border/40 bg-surface-primary"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Osobna certifikacija — mapiranje</CardTitle>
              <CardDescription>
                Shema (iz registra ili fallback), razina, datumi, broj, QR, hash. Različiti PDF po razini: dodajte ključ
                razine i URL u tablici ispod.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fallback naziv sheme (ako Dynamo shema nije dostupna)</Label>
                <Input
                  value={certificateConfig.personCertificationCertificateDesigner.schemeDisplayLabel}
                  onChange={(e) =>
                    patchCertificateConfig({
                      personCertificationCertificateDesigner: {
                        ...certificateConfig.personCertificationCertificateDesigner,
                        schemeDisplayLabel: e.target.value,
                      },
                    })
                  }
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Ime i prezime", "fullName"],
                    ["Certifikacijska shema", "certificationScheme"],
                    ["Razina certifikacije", "certificationLevel"],
                    ["Datum izdavanja", "issueDate"],
                    ["Datum isteka", "expiryDate"],
                    ["Broj certifikata", "certificateNumber"],
                    ["QR / verifikacija", "qrCode"],
                    ["Digitalni otisak (hash)", "digitalSignatureHash"],
                  ] as const
                ).map(([label, fk]) => {
                  const pm = certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping;
                  const val =
                    fk === "fullName"
                      ? pm.fullName
                      : fk === "certificationScheme"
                        ? pm.certificationScheme
                        : fk === "certificationLevel"
                          ? pm.certificationLevel
                          : fk === "issueDate"
                            ? pm.issueDate
                            : fk === "expiryDate"
                              ? pm.expiryDate
                              : fk === "certificateNumber"
                                ? pm.certificateNumber
                                : fk === "qrCode"
                                  ? pm.qrCode
                                  : pm.digitalSignatureHash;
                  return (
                    <div key={fk} className="space-y-1">
                      <Label className="text-xs text-text-muted">{label}</Label>
                      <Input
                        value={val}
                        onChange={(e) => {
                          const v = e.target.value;
                          const base = certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping;
                          patchCertificateConfig({
                            personCertificationCertificateDesigner: {
                              ...certificateConfig.personCertificationCertificateDesigner,
                              pdfFieldMapping: { ...base, [fk]: v },
                            },
                          });
                        }}
                        className="border-border/40 bg-surface-primary"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="rounded-md border border-border/40 p-3">
                <p className="mb-2 text-xs font-medium text-text-secondary">Šablon po razini (opcionalno)</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Ključ razine (npr. FOUNDATION)</Label>
                    <Input
                      id="level-key-draft"
                      className="border-border/40 bg-surface-primary font-mono text-sm"
                      placeholder="FOUNDATION"
                    />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <Label className="text-xs">URL PDF šablona za tu razinu</Label>
                    <Input
                      id="level-url-draft"
                      className="border-border/40 bg-surface-primary font-mono text-sm"
                      placeholder="https://…"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => {
                      const ke = document.getElementById("level-key-draft") as HTMLInputElement | null;
                      const ue = document.getElementById("level-url-draft") as HTMLInputElement | null;
                      const k = ke?.value?.trim() ?? "";
                      const u = ue?.value?.trim() ?? "";
                      if (!k) {
                        return;
                      }
                      const emptyPm = defaultCertificateConfig().personCertificationCertificateDesigner.pdfFieldMapping;
                      patchCertificateConfig({
                        personCertificationCertificateDesigner: {
                          ...certificateConfig.personCertificationCertificateDesigner,
                          levelTemplates: {
                            ...certificateConfig.personCertificationCertificateDesigner.levelTemplates,
                            [k]: {
                              certificateTemplatePdfUrl: u,
                              pdfFieldMapping: { ...emptyPm },
                            },
                          },
                        },
                      });
                      if (ke) {
                        ke.value = "";
                      }
                      if (ue) {
                        ue.value = "";
                      }
                    }}
                  >
                    Spremi razinu
                  </Button>
                </div>
                {Object.keys(certificateConfig.personCertificationCertificateDesigner.levelTemplates).length ? (
                  <ul className="mt-3 space-y-1 text-xs text-text-muted">
                    {Object.entries(certificateConfig.personCertificationCertificateDesigner.levelTemplates).map(
                      ([k, t]) => (
                        <li key={k} className="flex items-center justify-between gap-2 font-mono">
                          <span>
                            {k}: {t.certificateTemplatePdfUrl?.slice(0, 64) || "(prazno)"}
                          </span>
                          <button
                            type="button"
                            className="text-red-400 hover:underline"
                            onClick={() => {
                              const next = { ...certificateConfig.personCertificationCertificateDesigner.levelTemplates };
                              delete next[k];
                              patchCertificateConfig({
                                personCertificationCertificateDesigner: {
                                  ...certificateConfig.personCertificationCertificateDesigner,
                                  levelTemplates: next,
                                },
                              });
                            }}
                          >
                            ukloni
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">Nema razina — koristi se zadani URL osobne certifikacije.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Tekstualni potpis i izjava (ReportLab / naslijeđe)</CardTitle>
              <CardDescription>
                Koristi se kad se generira ugrađeni PDF bez AcroForm šablona; placeholderi {"{fullName}"}, {"{courseName}"}, …
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Naslov certifikata</Label>
                <Input
                  value={certificateConfig.certTitle}
                  onChange={(e) => patchCertificateConfig({ certTitle: e.target.value })}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Tekst izjave</Label>
                <textarea
                  value={certificateConfig.certStatement}
                  onChange={(e) => patchCertificateConfig({ certStatement: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border/40 bg-surface-primary px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={saving}
            onClick={() => void handleSaveCertificateTab()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Spremi certifikat
          </Button>
        </TabsContent>

        <TabsContent value="exam" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Završni ispit i prag prolaznosti</CardTitle>
              <CardDescription>
                Ukupan broj pitanja, prag, pokušaji i ukupno vrijeme ispita. Ponovni pokušaj i razmak između pokušaja
                podešavaju se u nastavku.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                <Checkbox
                  checked={examConfig.hasFinalExam}
                  onCheckedChange={(c) => patchExamConfig({ hasFinalExam: c === true })}
                />
                Kurs ima završni ispit
              </label>
              <div className="space-y-2">
                <Label>Broj pitanja</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={examConfig.questionsCount}
                  onChange={(e) => patchExamConfig({ questionsCount: Number(e.target.value) || 1 })}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Prag prolaznosti (% tačnih)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={examConfig.passingScorePct}
                  onChange={(e) => patchExamConfig({ passingScorePct: Number(e.target.value) || 70 })}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Dozvoljeni pokušaji</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={examConfig.attemptsAllowed}
                  onChange={(e) => patchExamConfig({ attemptsAllowed: Number(e.target.value) || 1 })}
                  className="border-border/40 bg-surface-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Ukupno vrijeme ispita (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={examConfig.durationMinutes}
                  onChange={(e) => patchExamConfig({ durationMinutes: Number(e.target.value) || 1 })}
                  className="border-border/40 bg-surface-primary"
                />
                <p className="text-xs text-text-muted">
                  Prosječno vrijeme po pitanju ≈{" "}
                  {examConfig.questionsCount > 0
                    ? Math.max(1, Math.round(examConfig.durationMinutes / examConfig.questionsCount))
                    : "—"}{" "}
                  min (informativno).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Ponovni pokušaj i sigurnost ispita</CardTitle>
              <CardDescription>Karenca između pokušaja, nasumični redoslijed i prikaz rezultata.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cb-cooldown">Retry / razmak između pokušaja</Label>
                <select
                  id="cb-cooldown"
                  value={String(examConfig.cooldownHours)}
                  onChange={(e) => patchExamConfig({ cooldownHours: Number(e.target.value) })}
                  className="flex h-10 max-w-md rounded-md border border-border/40 bg-surface-primary px-3 text-sm"
                >
                  <option value="0">Bez čekanja (0 h)</option>
                  <option value="12">12 sati</option>
                  <option value="24">24 sata</option>
                  <option value="48">48 sati</option>
                  <option value="168">7 dana</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={examConfig.identityCheckRequired}
                  onCheckedChange={(c) => patchExamConfig({ identityCheckRequired: c === true })}
                />
                Provjera identiteta pri ispitu
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={examConfig.requireMfa}
                  onCheckedChange={(c) => patchExamConfig({ requireMfa: c === true })}
                />
                Zahtijevaj MFA za ispit
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={examConfig.randomOrder}
                  onCheckedChange={(c) => patchExamConfig({ randomOrder: c === true })}
                />
                Nasumičan redoslijed pitanja
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={examConfig.showResults}
                  onCheckedChange={(c) => patchExamConfig({ showResults: c === true })}
                />
                Prikaži rezultat kandidatu nakon ispita
              </label>
            </CardContent>
          </Card>

          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={saving}
            onClick={() => void handleSaveExamTab()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Spremi ispit
          </Button>
        </TabsContent>

        <TabsContent value="certification" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Certifikacijski put</CardTitle>
              <CardDescription>
                Poveznica na aktivnu shemu iz registra, omogućene razine i pravila odluke povjerenstva.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm md:col-span-2">
                <Checkbox
                  checked={leadsToCertification}
                  onCheckedChange={(c) => setLeadsToCertification(c === true)}
                />
                Ovaj kurs vodi prema certifikaciji (registrirana shema)
              </label>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-scheme">Povezana certifikacijska shema</Label>
                <select
                  id="cb-scheme"
                  value={certSchemeRef}
                  onChange={(e) => setCertSchemeRef(e.target.value)}
                  className="flex h-10 w-full max-w-xl rounded-md border border-border/40 bg-surface-primary px-3 text-sm"
                >
                  <option value="">— nije odabrano —</option>
                  {schemeOptions.map((s) => (
                    <option key={s.schemeId} value={s.schemeId}>
                      {(s.code || s.schemeId) + (s.name ? ` — ${s.name}` : "")}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-muted">
                  Lista dolazi iz aktivnih shema (banka stavki). Dokumentacija prijave ostaje na shemi / obrascima
                  osobe — ovdje samo referenca.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cb-levels">Omogućene razine (zarez ili novi red, do 24)</Label>
                <textarea
                  id="cb-levels"
                  value={certLevelsText}
                  onChange={(e) => setCertLevelsText(e.target.value)}
                  rows={3}
                  placeholder="FOUNDATION, PRACTITIONER"
                  className="w-full rounded-md border border-border/40 bg-surface-primary px-3 py-2 font-mono text-sm"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm md:col-span-2">
                <Checkbox
                  checked={committeeDecisionRequired}
                  onCheckedChange={(c) => setCommitteeDecisionRequired(c === true)}
                />
                Potrebna odluka povjerenstva za certifikaciju
              </label>
              <div className="space-y-2">
                <Label htmlFor="cb-recert">Period recertifikacije (mjeseci)</Label>
                <Input
                  id="cb-recert"
                  type="number"
                  min={1}
                  max={600}
                  value={recertificationMonths === "" ? "" : recertificationMonths}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRecertificationMonths(v === "" ? "" : Number(v));
                  }}
                  placeholder="prazno = bez eksplicitnog ciklusa"
                  className="border-border/40 bg-surface-primary"
                />
              </div>
            </CardContent>
          </Card>
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={saving}
            onClick={() => void handleSaveCertificationTab()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Spremi certifikacijski put
          </Button>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-surface-secondary/60">
            <CardHeader>
              <CardTitle className="text-base">Tehnička validacija i objava</CardTitle>
              <CardDescription>
                Označavanje pregleda tehničkog povjerenstva. Ako je u sustavu uključeno{" "}
                <span className="font-mono">COURSE_PUBLISH_REQUIRES_TECHNICAL_VALIDATION</span>, objava bez valjanosti
                bit će odbijena (HTTP 400).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AccessibilityReadinessWidget
                summary={a11ySummary}
                loading={a11yLoading}
                error={a11yError}
              />
              <div className="rounded-md border border-border/40 bg-surface-primary/50 px-3 py-2 text-sm">
                <p>
                  Status validacije:{" "}
                  <span className="font-medium">
                    {courseMeta?.technicalCommitteeValidated ? "Potvrđeno" : "Nije potvrđeno"}
                  </span>
                </p>
                {courseMeta?.technicalCommitteeValidatedAt ? (
                  <p className="mt-1 text-xs text-text-muted">
                    Zadnja izmjena: {courseMeta.technicalCommitteeValidatedAt}
                    {courseMeta.technicalCommitteeValidatedBy
                      ? ` · ${courseMeta.technicalCommitteeValidatedBy}`
                      : ""}
                  </p>
                ) : null}
                {courseMeta?.technicalCommitteeValidationNotes ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    Bilješke (snimljeno): {courseMeta.technicalCommitteeValidationNotes}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb-val-notes">Bilješke uz sljedeću akciju</Label>
                <textarea
                  id="cb-val-notes"
                  value={validationNotesDraft}
                  onChange={(e) => setValidationNotesDraft(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border/40 bg-surface-primary px-3 py-2 text-sm"
                  placeholder="Opcionalno za audit."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving || !courseId || a11ySummary?.status === "red"}
                  onClick={() => {
                    void (async () => {
                      setErr(null);
                      setSaving(true);
                      try {
                        const vn = validationNotesDraft.trim();
                        await postTechnicalCommitteeValidation(courseId, {
                          validated: true,
                          ...(vn ? { notes: vn } : {}),
                        });
                        setValidationNotesDraft("");
                        await loadCurriculum(courseId);
                      } catch (e) {
                        setErr(e instanceof Error ? e.message : "Samo tehničko povjerenstvo ili sys_admin.");
                      } finally {
                        setSaving(false);
                      }
                    })();
                  }}
                >
                  Označi kao tehnički validirano
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || !courseId}
                  onClick={() => {
                    void (async () => {
                      setErr(null);
                      setSaving(true);
                      try {
                        const vn2 = validationNotesDraft.trim();
                        await postTechnicalCommitteeValidation(courseId, {
                          validated: false,
                          ...(vn2 ? { notes: vn2 } : {}),
                        });
                        setValidationNotesDraft("");
                        await loadCurriculum(courseId);
                      } catch (e) {
                        setErr(e instanceof Error ? e.message : "Samo tehničko povjerenstvo ili sys_admin.");
                      } finally {
                        setSaving(false);
                      }
                    })();
                  }}
                >
                  Poništi validaciju
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Objavu kursa (javno dostupno) podešava tab „Opšti dio”. Ako objava vrati grešku o validaciji, prvo
                potvrdite ovaj korak ili tražite da se flag u okruženju isključi.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
