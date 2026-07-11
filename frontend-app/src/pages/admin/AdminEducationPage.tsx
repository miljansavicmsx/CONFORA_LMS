import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { EducationCharts } from "@/components/education/EducationCharts";
import {
  adminAuditActionLabel,
  adminAuditResourceTypeLabel,
  adminEducationEventKeyLabel,
  adminReportStatusLabel,
  ADMIN_EDUCATION_READONLY_NOTICE,
  ADMIN_PILOT_SYNTHETIC_NOTICE,
  mapAdminChartRows,
} from "@/lib/admin-gov-ux-labels";
import {
  archiveAdminCourse,
  createAdminCourseDraft,
  downloadAdminEducationCsv,
  downloadAdminEducationDashboardPdf,
  downloadAdminEducationXlsx,
  fetchAdminAssignableTrainers,
  fetchAdminCompletionCertificate,
  fetchAdminCourseDetail,
  fetchAdminCourseEnrolments,
  fetchAdminCourseProgramme,
  fetchAdminCoursePublishReadiness,
  fetchAdminCourses,
  fetchAdminEducationAuditEvents,
  fetchAdminEducationCompletionsReport,
  fetchAdminEducationCourseSummaryReport,
  fetchAdminEducationDashboard,
  fetchAdminEducationEnrolmentsReport,
  fetchAdminEducationNotifications,
  fetchAdminEducationProgressReport,
  fetchAdminEnrolmentModuleProgress,
  patchAdminCourse,
  patchAdminCourseProgramme,
  pickI18n,
  publishAdminCourse,
} from "@/lib/admin-education-api";

const DEFAULT_SCOPE_ID = "a1000000-0000-4000-8000-000000000001";

export default function AdminEducationPage(): JSX.Element {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editLanguages, setEditLanguages] = useState("en");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDesc, setEditModuleDesc] = useState("");
  const [editTrainerName, setEditTrainerName] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  const trainersQ = useQuery({
    queryKey: ["admin", "education", "trainers"],
    queryFn: fetchAdminAssignableTrainers,
  });

  const notificationsQ = useQuery({
    queryKey: ["admin", "education", "notifications"],
    queryFn: fetchAdminEducationNotifications,
  });

  const listQ = useQuery({
    queryKey: ["admin", "education", "courses", statusFilter],
    queryFn: () => fetchAdminCourses(statusFilter || undefined),
  });

  const detailQ = useQuery({
    queryKey: ["admin", "education", "course", selectedId],
    queryFn: () => fetchAdminCourseDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const courseEnrolQ = useQuery({
    queryKey: ["admin", "education", "enrolments", selectedId],
    queryFn: () => fetchAdminCourseEnrolments(selectedId!),
    enabled: Boolean(selectedId),
  });

  const reportQ = useQuery({
    queryKey: ["admin", "education", "reports", "enrolments"],
    queryFn: () => fetchAdminEducationEnrolmentsReport(),
  });

  const completionsReportQ = useQuery({
    queryKey: ["admin", "education", "reports", "completions"],
    queryFn: () => fetchAdminEducationCompletionsReport(),
  });

  const progressReportQ = useQuery({
    queryKey: ["admin", "education", "reports", "progress"],
    queryFn: () => fetchAdminEducationProgressReport(),
  });

  const courseSummaryQ = useQuery({
    queryKey: ["admin", "education", "reports", "course-summary"],
    queryFn: () => fetchAdminEducationCourseSummaryReport(),
  });

  const dashboardQ = useQuery({
    queryKey: ["admin", "education", "reports", "dashboard"],
    queryFn: () => fetchAdminEducationDashboard(),
  });

  const publishReadinessQ = useQuery({
    queryKey: ["admin", "education", "publish-readiness", selectedId],
    queryFn: () => fetchAdminCoursePublishReadiness(selectedId!),
    enabled: Boolean(selectedId),
  });

  const programmeQ = useQuery({
    queryKey: ["admin", "education", "programme", selectedId],
    queryFn: () => fetchAdminCourseProgramme(selectedId!),
    enabled: Boolean(selectedId),
  });

  const auditQ = useQuery({
    queryKey: ["admin", "education", "audit"],
    queryFn: () => fetchAdminEducationAuditEvents(),
  });

  const adminModuleQ = useQuery({
    queryKey: ["admin", "education", "module-progress", selectedEnrolmentId],
    queryFn: () => fetchAdminEnrolmentModuleProgress(selectedEnrolmentId!),
    enabled: Boolean(selectedEnrolmentId),
  });

  const selectedTitle = useMemo(() => {
    if (!detailQ.data) return "";
    return pickI18n(detailQ.data.titleI18n);
  }, [detailQ.data]);

  const syncEditFromDetail = (): void => {
    const d = detailQ.data;
    if (!d) return;
    setEditTitle(pickI18n(d.titleI18n));
    setEditObjective(d.objective ?? "");
    setEditDuration(d.durationMin != null ? String(d.durationMin) : "");
    setEditTarget(d.targetAudience ?? "");
    setEditLanguages((d.languages ?? ["en"]).join(", "));
  };

  const savePatch = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No course selected");
      const langs = editLanguages
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      return patchAdminCourse(selectedId, {
        titleI18n: { en: editTitle.trim() || "Untitled course" },
        objective: editObjective.trim() || null,
        durationMin: editDuration.trim() ? Number(editDuration) : null,
        targetAudience: editTarget.trim() || null,
        languages: langs.length ? langs : ["en"],
      });
    },
    onSuccess: async () => {
      setMessage("Saved.");
      await qc.invalidateQueries({ queryKey: ["admin", "education"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const createDraft = useMutation({
    mutationFn: () =>
      createAdminCourseDraft({
        scopeId: DEFAULT_SCOPE_ID,
        titleI18n: { en: "New EDU-MVP draft course" },
      }),
    onSuccess: async (c) => {
      setSelectedId(c.id);
      setMessage("Draft created.");
      await qc.invalidateQueries({ queryKey: ["admin", "education"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const publish = useMutation({
    mutationFn: () => publishAdminCourse(selectedId!),
    onSuccess: async () => {
      setMessage("Publish action completed (may require full ISO publish gate).");
      await qc.invalidateQueries({ queryKey: ["admin", "education"] });
    },
    onError: (e: Error) =>
      setMessage(`Publish deferred: ${e.message}. Use seed PUBLIC status for catalogue MVP.`),
  });

  const archive = useMutation({
    mutationFn: () => archiveAdminCourse(selectedId!),
    onSuccess: async () => {
      setMessage("Course archived.");
      await qc.invalidateQueries({ queryKey: ["admin", "education"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const addOutcome = useMutation({
    mutationFn: () =>
      addAdminKnowledgePoint(selectedId!, {
        code: `LO-${Date.now().toString(36).slice(-4)}`,
        name: "Pilot learning outcome",
        description: "Synthetic EDU-MVP-1 outcome (local only).",
      }),
    onSuccess: async () => {
      setMessage("Learning outcome added.");
      await qc.invalidateQueries({ queryKey: ["admin", "education", "course", selectedId] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const saveProgramme = useMutation({
    mutationFn: async () => {
      if (!selectedId || !programmeQ.data) throw new Error("No course selected");
      const modules = [...programmeQ.data.modules];
      if (editModuleTitle.trim()) {
        modules.push({
          id: `mod-${Date.now().toString(36).slice(-4)}`,
          title: editModuleTitle.trim(),
          description: editModuleDesc.trim() || null,
          order: modules.length + 1,
          durationMin: 60,
        });
      }
      return patchAdminCourseProgramme(selectedId, {
        modules,
        trainer: (() => {
          const picked = (trainersQ.data ?? []).find((t) => t.userId === selectedTrainerId);
          if (picked) {
            return { name: picked.name, email: picked.email, role: picked.role };
          }
          if (editTrainerName.trim()) {
            return {
              name: editTrainerName.trim(),
              email: programmeQ.data.trainer?.email ?? null,
              role: programmeQ.data.trainer?.role ?? "Trainer",
            };
          }
          return programmeQ.data.trainer;
        })(),
      });
    },
    onSuccess: async () => {
      setMessage("Programme saved.");
      setEditModuleTitle("");
      setEditModuleDesc("");
      await qc.invalidateQueries({ queryKey: ["admin", "education"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="admin-education-page">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary" data-testid="admin-education-heading">
              Upravljanje edukacijama
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              EDU-MVP-5 — potvrde o završetku, grafikoni, XLSX/PDF izvoz i Mailhog obavijesti.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            data-testid="admin-education-create-draft"
            disabled={createDraft.isPending}
            onClick={() => createDraft.mutate()}
          >
            Novi nacrt
          </Button>
        </header>

        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-text-secondary">
          {ADMIN_EDUCATION_READONLY_NOTICE}
        </p>

        <p
          className="rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs text-text-secondary"
          data-testid="admin-education-synthetic-banner"
        >
          {ADMIN_PILOT_SYNTHETIC_NOTICE}
        </p>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-dashboard-cards">
          <h2 className="text-sm font-semibold text-text-primary">Pregled izvještaja edukacije</h2>
          <p className="mt-1 text-xs text-text-muted" data-testid="admin-education-readonly-badge">
            Izvještaj samo za čitanje — bez izmjene podataka
          </p>
          {dashboardQ.isPending ? (
            <p className="mt-2 text-xs text-text-secondary">Učitavanje pregleda…</p>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/40 px-3 py-2" data-testid="admin-dashboard-enrolments">
              <p className="text-xs text-text-muted">Upisi</p>
              <p className="text-xl font-semibold">{dashboardQ.data?.enrolmentCount ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border/40 px-3 py-2" data-testid="admin-dashboard-completions">
              <p className="text-xs text-text-muted">Završene edukacije</p>
              <p className="text-xl font-semibold">{dashboardQ.data?.completionCount ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border/40 px-3 py-2" data-testid="admin-dashboard-public">
              <p className="text-xs text-text-muted">Objavljene edukacije</p>
              <p className="text-xl font-semibold">{dashboardQ.data?.publicCourseCount ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border/40 px-3 py-2" data-testid="admin-dashboard-draft">
              <p className="text-xs text-text-muted">Nacrti edukacija</p>
              <p className="text-xl font-semibold">{dashboardQ.data?.draftCourseCount ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border/40 px-3 py-2" data-testid="admin-dashboard-completion-rate">
              <p className="text-xs text-text-muted">Stopa završetka</p>
              <p className="text-xl font-semibold">{dashboardQ.data?.completionRate ?? "—"}%</p>
            </div>
          </div>
          {dashboardQ.data?.chartData ? (
            <EducationCharts
              progressDistribution={mapAdminChartRows(dashboardQ.data.chartData.progressDistribution)}
              courseStatus={mapAdminChartRows(dashboardQ.data.chartData.courseStatus)}
              enrolmentByStatus={
                dashboardQ.data.chartData.enrolmentByStatus
                  ? mapAdminChartRows(dashboardQ.data.chartData.enrolmentByStatus)
                  : undefined
              }
              activity={
                dashboardQ.data.chartData.activity
                  ? mapAdminChartRows(dashboardQ.data.chartData.activity)
                  : undefined
              }
            />
          ) : null}
          {progressReportQ.data ? (
            <div className="mt-4 text-xs text-text-secondary" data-testid="admin-dashboard-progress-distribution">
              Raspodjela napretka: {adminReportStatusLabel("NOT_STARTED")}{" "}
              {progressReportQ.data.progressDistribution.NOT_STARTED} · {adminReportStatusLabel("IN_PROGRESS")}{" "}
              {progressReportQ.data.progressDistribution.IN_PROGRESS} · {adminReportStatusLabel("COMPLETED")}{" "}
              {progressReportQ.data.progressDistribution.COMPLETED}
            </div>
          ) : null}
        </section>

        {message ? (
          <p className="text-sm text-text-secondary" data-testid="admin-education-message">
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-text-muted">
            Filter statusa
            <select
              className="ml-2 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="admin-education-status-filter"
            >
              <option value="">Svi</option>
              <option value="DRAFT">{adminReportStatusLabel("DRAFT")}</option>
              <option value="PUBLIC">{adminReportStatusLabel("PUBLIC")}</option>
              <option value="ARCHIVED">{adminReportStatusLabel("ARCHIVED")}</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="edu-list-heading">
            <h2 id="edu-list-heading" className="text-sm font-semibold text-text-primary">
              Courses
            </h2>
            {listQ.isError ? (
              <p className="mt-2 text-sm text-red-400">Unable to load courses (check Nest + auth).</p>
            ) : null}
            <ul className="mt-3 space-y-2" data-testid="admin-education-course-list">
              {(listQ.data ?? []).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selectedId === c.id ? "border-brand bg-brand/10" : "border-border/50"
                    }`}
                    data-testid={`admin-education-row-${c.id}`}
                    onClick={() => {
                      setSelectedId(c.id);
                      setMessage(null);
                    }}
                  >
                    <span className="font-medium">{pickI18n(c.titleI18n)}</span>
                    <span className="ml-2 text-xs text-text-muted">{adminReportStatusLabel(c.status)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="edu-detail-heading">
            <h2 id="edu-detail-heading" className="text-sm font-semibold text-text-primary">
              Detail
            </h2>
            {!selectedId ? (
              <p className="mt-2 text-sm text-text-muted">Select a course.</p>
            ) : detailQ.isPending ? (
              <p className="mt-2 text-sm text-text-secondary">Loading…</p>
            ) : detailQ.data ? (
              <div className="mt-3 space-y-4 rounded-xl border border-border/50 p-4" data-testid="admin-education-detail">
                <p className="text-xs text-text-muted">
                  ID: {detailQ.data.id} · Status:{" "}
                  <span data-testid="admin-education-detail-status">{adminReportStatusLabel(detailQ.data.status)}</span>
                </p>
                <p className="text-lg font-semibold" data-testid="admin-education-detail-title">
                  {selectedTitle}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={syncEditFromDetail}>
                    Load into editor
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="admin-education-save"
                    disabled={savePatch.isPending}
                    onClick={() => savePatch.mutate()}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    data-testid="admin-education-publish"
                    disabled={publish.isPending}
                    onClick={() => publish.mutate()}
                  >
                    Publish
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={archive.isPending}
                    onClick={() => archive.mutate()}
                  >
                    Archive
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    data-testid="admin-education-add-outcome"
                    disabled={addOutcome.isPending}
                    onClick={() => addOutcome.mutate()}
                  >
                    Add outcome
                  </Button>
                </div>

                <label className="block text-xs text-text-muted">
                  Title (en)
                  <input
                    className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    data-testid="admin-education-edit-title"
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Objective
                  <textarea
                    className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                    rows={2}
                    value={editObjective}
                    onChange={(e) => setEditObjective(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Duration (minutes)
                  <input
                    className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Target group
                  <input
                    className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Languages (comma-separated)
                  <input
                    className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                    value={editLanguages}
                    onChange={(e) => setEditLanguages(e.target.value)}
                  />
                </label>

                <div>
                  <h3 className="text-sm font-medium">Learning outcomes</h3>
                  <ul className="mt-2 space-y-1 text-xs text-text-secondary" data-testid="admin-education-outcomes">
                    {(detailQ.data.knowledgePoints ?? []).map((kp) => (
                      <li key={kp.id}>
                        <span className="font-mono">{kp.code}</span> — {kp.name}
                        {kp.description ? `: ${kp.description}` : null}
                      </li>
                    ))}
                    {!detailQ.data.knowledgePoints?.length ? <li>—</li> : null}
                  </ul>
                </div>

                <div data-testid="admin-education-publish-readiness">
                  <h3 className="text-sm font-medium">Publish readiness</h3>
                  {publishReadinessQ.isPending ? (
                    <p className="mt-1 text-xs text-text-muted">Evaluating…</p>
                  ) : publishReadinessQ.data ? (
                    <div className="mt-2 space-y-1 text-xs text-text-secondary">
                      <p data-testid="admin-education-readiness-score">
                        Score: {publishReadinessQ.data.readinessScore}% · Ready:{" "}
                        {publishReadinessQ.data.readyForCatalogue ? "yes" : "no"} · Publish allowed:{" "}
                        {publishReadinessQ.data.publishAllowed ? "yes" : "no"}
                      </p>
                      {publishReadinessQ.data.blockedReasons?.length ? (
                        <p className="text-amber-400" data-testid="admin-publish-blocked-reasons">
                          Blocked: {publishReadinessQ.data.blockedReasons.join(", ")}
                        </p>
                      ) : null}
                      <ul className="space-y-0.5">
                        {publishReadinessQ.data.checks.map((c) => (
                          <li key={c.id} data-testid={`admin-readiness-check-${c.id}`}>
                            {c.pass ? "✓" : "○"} {c.label} — {c.detail}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-text-muted">{publishReadinessQ.data.boundaryNote}</p>
                    </div>
                  ) : null}
                </div>

                <div data-testid="admin-education-programme-editor">
                  <h3 className="text-sm font-medium">Programme editor</h3>
                  <div className="mt-2 space-y-2 text-xs">
                    <label className="block text-text-muted">
                      Add module title
                      <input
                        className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                        value={editModuleTitle}
                        onChange={(e) => setEditModuleTitle(e.target.value)}
                        data-testid="admin-programme-edit-module-title"
                      />
                    </label>
                    <label className="block text-text-muted">
                      Module description
                      <input
                        className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                        value={editModuleDesc}
                        onChange={(e) => setEditModuleDesc(e.target.value)}
                      />
                    </label>
                    <label className="block text-text-muted">
                      Assign trainer (staff list)
                      <select
                        className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                        value={selectedTrainerId}
                        onChange={(e) => {
                          setSelectedTrainerId(e.target.value);
                          const t = (trainersQ.data ?? []).find((x) => x.userId === e.target.value);
                          if (t) setEditTrainerName(t.name);
                        }}
                        data-testid="admin-programme-trainer-select"
                      >
                        <option value="">— manual or existing —</option>
                        {(trainersQ.data ?? []).map((t) => (
                          <option key={t.userId} value={t.userId}>
                            {t.name} ({t.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-text-muted">
                      Trainer name (manual override)
                      <input
                        className="mt-1 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
                        value={editTrainerName}
                        onChange={(e) => setEditTrainerName(e.target.value)}
                        placeholder={programmeQ.data?.trainer?.name ?? ""}
                        data-testid="admin-programme-edit-trainer"
                      />
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      data-testid="admin-programme-save"
                      disabled={saveProgramme.isPending}
                      onClick={() => saveProgramme.mutate()}
                    >
                      Save programme
                    </Button>
                  </div>
                </div>

                <div data-testid="admin-education-programme-modules">
                  <h3 className="text-sm font-medium">Programme modules</h3>
                  {programmeQ.isPending ? (
                    <p className="mt-1 text-xs text-text-muted">Loading…</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                      {(programmeQ.data?.modules ?? []).map((m) => (
                        <li key={m.id} data-testid={`admin-programme-module-${m.id}`}>
                          {m.order}. {m.title}
                          {m.durationMin ? ` (${m.durationMin} min)` : ""}
                          {m.description ? ` — ${m.description}` : ""}
                        </li>
                      ))}
                      {!programmeQ.data?.modules?.length ? <li>—</li> : null}
                    </ul>
                  )}
                  {programmeQ.data?.trainer ? (
                    <p className="mt-2 text-xs text-text-secondary" data-testid="admin-education-trainer">
                      Trainer: {programmeQ.data.trainer.name}
                      {programmeQ.data.trainer.role ? ` · ${programmeQ.data.trainer.role}` : ""}
                    </p>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-medium">Enrolments & module progress</h3>
                  <ul className="mt-2 space-y-1 text-xs text-text-secondary" data-testid="admin-education-enrolments">
                    {(courseEnrolQ.data ?? []).map((row) => (
                      <li key={row.id} data-testid={`admin-enrolment-row-${row.id}`}>
                        <button
                          type="button"
                          className="text-left underline-offset-2 hover:underline"
                          onClick={() => setSelectedEnrolmentId(selectedEnrolmentId === row.id ? null : row.id)}
                        >
                          {row.learnerEmail} · {adminReportStatusLabel(row.progressStatus)} · {row.progressPct}%
                        </button>
                        {row.evidence ? ` · ${row.evidence.reference}` : ""}
                        {row.enrolmentStatus === "COMPLETED" ? (
                          <button
                            type="button"
                            className="ml-2 text-brand underline-offset-2 hover:underline"
                            data-testid={`admin-view-completion-cert-${row.id}`}
                            onClick={() =>
                              fetchAdminCompletionCertificate(row.id)
                                .then((c) =>
                                  setMessage(
                                    `Education Certificate of Completion: ${c.reference} — NOT a certification certificate.`,
                                  ),
                                )
                                .catch((e: Error) => setMessage(e.message))
                            }
                          >
                            View completion cert
                          </button>
                        ) : null}
                      </li>
                    ))}
                    {!courseEnrolQ.data?.length ? <li>—</li> : null}
                  </ul>
                  {selectedEnrolmentId && adminModuleQ.data ? (
                    <ul className="mt-2 space-y-1 text-xs" data-testid="admin-module-progress-detail">
                      {adminModuleQ.data.modules.map((m) => (
                        <li key={m.moduleId}>
                          {m.title}: {adminReportStatusLabel(m.status)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-reports">
          <h2 className="text-sm font-semibold text-text-primary">Education reports (read-only)</h2>
          <p className="mt-1 text-xs text-text-muted">
            JSON reports + CSV/XLSX/PDF export · audit on access/export · tenant-scoped · read-only
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-education-export-enrolments-csv"
              onClick={() => downloadAdminEducationCsv("enrolments").catch((e: Error) => setMessage(e.message))}
            >
              Export enrolments CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-education-export-completions-csv"
              onClick={() => downloadAdminEducationCsv("completions").catch((e: Error) => setMessage(e.message))}
            >
              Export completions CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-education-export-enrolments-xlsx"
              onClick={() => downloadAdminEducationXlsx("enrolments").catch((e: Error) => setMessage(e.message))}
            >
              Export enrolments XLSX
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-education-export-completions-xlsx"
              onClick={() => downloadAdminEducationXlsx("completions").catch((e: Error) => setMessage(e.message))}
            >
              Export completions XLSX
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-education-export-dashboard-pdf"
              onClick={() => downloadAdminEducationDashboardPdf().catch((e: Error) => setMessage(e.message))}
            >
              Export dashboard PDF
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto" data-testid="admin-education-reports-table">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-1 pr-2">Course</th>
                  <th className="py-1 pr-2">Learner</th>
                  <th className="py-1 pr-2">Progress</th>
                  <th className="py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {(reportQ.data?.items ?? []).slice(0, 15).map((r) => (
                  <tr key={r.enrolmentId} className="border-b border-border/20">
                    <td className="py-1 pr-2">{r.courseTitle}</td>
                    <td className="py-1 pr-2">{r.learnerEmail}</td>
                    <td className="py-1 pr-2">{r.progressPct}%</td>
                    <td className="py-1">{adminReportStatusLabel(r.progressStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium">Enrolments</h3>
              <ul className="mt-2 max-h-48 overflow-auto text-xs text-text-secondary">
                {(reportQ.data?.items ?? []).slice(0, 20).map((r) => (
                  <li key={r.enrolmentId}>
                    {r.courseTitle} — {r.learnerEmail} — {adminReportStatusLabel(r.progressStatus)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium">Completions</h3>
              <ul className="mt-2 max-h-48 overflow-auto text-xs text-text-secondary" data-testid="admin-education-completions-report">
                {(completionsReportQ.data?.items ?? []).map((r) => (
                  <li key={r.enrolmentId}>
                    {r.learnerEmail} — {r.completedAt?.slice(0, 10) ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {courseSummaryQ.data ? (
            <div className="mt-4 text-xs text-text-secondary" data-testid="admin-education-course-summary">
              <h3 className="font-medium">Course summary</h3>
              <ul className="mt-1 space-y-1">
                {courseSummaryQ.data.items.map((c) => (
                  <li key={c.courseId}>
                    {c.title} · {adminReportStatusLabel(c.status)} · upisi {c.enrolmentCount} · završetci {c.completionCount} · moduli{" "}
                    {c.moduleCount}
                    {c.trainerName ? ` · trainer ${c.trainerName}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-notifications">
          <h2 className="text-sm font-semibold text-text-primary">Mailhog notification verification</h2>
          <p className="mt-1 text-xs text-text-muted">
            Synthetic education notifications · Mailhog{" "}
            {notificationsQ.data?.mailhogConfigured ? "configured" : "not configured"}
          </p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-xs text-text-secondary">
            {(notificationsQ.data?.items ?? []).slice(0, 20).map((n) => (
              <li key={n.id} data-testid={`admin-notification-row-${n.id}`}>
                {n.occurredAt.slice(0, 19)} · {adminEducationEventKeyLabel(n.eventKey || n.action)} · {n.recipientEmail} ·{" "}
                <span data-testid={`admin-notification-status-${n.id}`}>{adminReportStatusLabel(n.status)}</span>
                {n.mailSent ? " (Mailhog sent)" : " (audit only)"}
              </li>
            ))}
            {!notificationsQ.data?.items?.length ? <li>—</li> : null}
          </ul>
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-audit-viewer">
          <h2 className="text-sm font-semibold text-text-primary">Education audit viewer (read-only)</h2>
          <p className="mt-1 text-xs text-text-muted">
            Nedavni događaji izvještaja, upisa, napretka i obavijesti edukacije
          </p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-xs text-text-secondary">
            {(auditQ.data?.items ?? []).slice(0, 30).map((ev) => (
              <li key={ev.id} data-testid={`admin-audit-row-${ev.id}`}>
                {ev.occurredAt.slice(0, 19)} · {adminAuditActionLabel(ev.action)} ·{" "}
                {adminAuditResourceTypeLabel(ev.resourceType)}
                {ev.resourceId ? ` · ${ev.resourceId.slice(0, 8)}…` : ""}
              </li>
            ))}
            {!auditQ.data?.items?.length ? <li>—</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
