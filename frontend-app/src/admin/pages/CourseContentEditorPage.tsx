import { useCallback, useEffect, type JSX } from "react";
import { useSearchParams } from "react-router";

import { CenterEditorPanel } from "@/admin/content-editor/components/CenterEditorPanel";
import { ContentEditorTopBar } from "@/admin/content-editor/components/ContentEditorTopBar";
import { LessonSettingsPanel } from "@/admin/content-editor/components/LessonSettingsPanel";
import { StructureTreePanel } from "@/admin/content-editor/components/StructureTreePanel";
import { findLessonInStore, useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import { Button } from "@/components/ui/button";

/** D.8 — Admin kreator sadržaja (dark split view). */
export default function CourseContentEditorPage(): JSX.Element {
  const [params] = useSearchParams();
  const courseId = params.get("courseId")?.trim() || null;

  const courseTitle = useContentEditorStore((s) => s.courseTitle);
  const setCourseTitle = useContentEditorStore((s) => s.setCourseTitle);
  const lastSavedLabel = useContentEditorStore((s) => s.lastSavedLabel);
  const touchSave = useContentEditorStore((s) => s.touchSave);
  const modules = useContentEditorStore((s) => s.modules);
  const selectedLessonId = useContentEditorStore((s) => s.selectedLessonId);

  const curriculumLoadStatus = useContentEditorStore((s) => s.curriculumLoadStatus);
  const curriculumLoadError = useContentEditorStore((s) => s.curriculumLoadError);
  const curriculumSaveStatus = useContentEditorStore((s) => s.curriculumSaveStatus);
  const curriculumSaveError = useContentEditorStore((s) => s.curriculumSaveError);
  const loadCurriculum = useContentEditorStore((s) => s.loadCurriculum);
  const saveCurriculum = useContentEditorStore((s) => s.saveCurriculum);
  const clearCurriculumSaveError = useContentEditorStore((s) => s.clearCurriculumSaveError);

  useEffect(() => {
    if (!courseId) {
      useContentEditorStore.setState({
        curriculumLoadStatus: "idle",
        curriculumLoadError: null,
      });
      return;
    }
    void loadCurriculum(courseId);
  }, [courseId, loadCurriculum]);

  useEffect(() => {
    const id = window.setInterval(() => {
      touchSave();
    }, 45_000);
    return () => window.clearInterval(id);
  }, [touchSave]);

  const handleSaveDraft = useCallback(async () => {
    clearCurriculumSaveError();
    if (!courseId) {
      touchSave();
      window.alert(
        "Dodaj ?courseId=... u URL (npr. course-iso27001-li) da spremiš kurikulum u DynamoDB.",
      );
      return;
    }
    await saveCurriculum(courseId);
    const err = useContentEditorStore.getState().curriculumSaveError;
    if (err) {
      window.alert(err);
    }
  }, [courseId, clearCurriculumSaveError, saveCurriculum, touchSave]);

  const handlePreview = useCallback(() => {
    if (!courseId) {
      window.alert("Za pregled u playeru dodaj ?courseId=... u URL i budi upisan na kurs.");
      return;
    }
    const path = `/learn/${encodeURIComponent(courseId)}`;
    window.open(path, "_blank", "noopener,noreferrer");
  }, [courseId]);

  const selectedLesson = findLessonInStore(modules, selectedLessonId);

  const showLoading = Boolean(courseId && curriculumLoadStatus === "loading");
  const showLoadError = Boolean(courseId && curriculumLoadStatus === "error");
  const isSaving = curriculumSaveStatus === "saving";

  if (showLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Učitavanje kurikuluma…
      </div>
    );
  }

  if (showLoadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border/40 bg-surface-secondary/40 p-6 text-text-primary">
        <p className="text-sm text-text-secondary">
          {curriculumLoadError ||
            "Ne možemo učitati kurikulum. Provjeri courseId, token i ulogu (admin/instructor)."}
        </p>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Pokušaj ponovo
        </Button>
      </div>
    );
  }

  return (
    <div className="dark -mx-4 -mt-4 flex min-h-[calc(100svh-9rem)] flex-col overflow-hidden rounded-xl border border-border/25 bg-surface-primary text-text-primary shadow-sm sm:-mx-6">
      {!courseId ? (
        <p className="border-b border-border/30 bg-surface-secondary/30 px-4 py-2 text-xs text-text-muted">
          Lokalni draft bez baze. Za spremanje u DynamoDB otvori npr.{" "}
          <span className="font-mono text-text-secondary">
            /dashboard/admin/sadrzaj?courseId=course-iso27001-li
          </span>
          .
        </p>
      ) : null}
      {courseId && curriculumSaveError && curriculumSaveStatus === "error" ? (
        <p className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {curriculumSaveError}
        </p>
      ) : null}
      <ContentEditorTopBar
        courseTitle={courseTitle}
        onCourseTitleChange={setCourseTitle}
        activeStepIndex={1}
        lastSavedLabel={lastSavedLabel}
        onPreview={handlePreview}
        onSaveDraft={() => void handleSaveDraft()}
        isSaving={isSaving}
        saveDraftDisabled={isSaving}
      />
      <div className="flex min-h-0 flex-1">
        <StructureTreePanel />
        <CenterEditorPanel />
        <LessonSettingsPanel lesson={selectedLesson} />
      </div>
    </div>
  );
}
