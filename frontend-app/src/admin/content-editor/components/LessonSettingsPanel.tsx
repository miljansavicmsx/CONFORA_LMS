"use client";

import { Eye, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type JSX } from "react";

import type { EditorContentType, EditorLesson } from "@/admin/content-editor/types";
import { generateId, useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TYPE_LABELS: Record<EditorContentType, string> = {
  text: "Tekst",
  video: "Video",
  pdf: "PDF",
  quiz: "Kviz",
};

function applyCertificatePreviewPlaceholders(
  text: string,
  vars: { fullName: string; courseName: string; score: string; date: string },
): string {
  return text
    .replace(/\{fullName\}/gi, vars.fullName)
    .replace(/\{courseName\}/gi, vars.courseName)
    .replace(/\{score\}/gi, vars.score)
    .replace(/\{date\}/gi, vars.date);
}

export function LessonSettingsPanel({ lesson }: { readonly lesson: EditorLesson | null }): JSX.Element {
  const patchLesson = useContentEditorStore((s) => s.patchLesson);
  const courseCertifiable = useContentEditorStore((s) => s.courseCertifiable);
  const examConfig = useContentEditorStore((s) => s.examConfig);
  const patchExamConfig = useContentEditorStore((s) => s.patchExamConfig);
  const courseTitle = useContentEditorStore((s) => s.courseTitle);
  const certificateConfig = useContentEditorStore((s) => s.certificateConfig);
  const patchCertificateConfig = useContentEditorStore((s) => s.patchCertificateConfig);

  const [previewOpen, setPreviewOpen] = useState(false);

  const previewResolved = useMemo(() => {
    const dummy = {
      fullName: "Amira Hodžić",
      courseName: courseTitle.trim() || "Primjer naziva kursa",
      score: "87%",
      date: new Date().toLocaleDateString("bs-BA", { dateStyle: "long" }),
    };
    const title =
      certificateConfig.certTitle.trim() || "POTVRDA O ZAVRŠENOJ OBUCI";
    const body = certificateConfig.certStatement.trim()
      ? applyCertificatePreviewPlaceholders(certificateConfig.certStatement, dummy)
      : "— (prazan tekst izjave — na PDF-u će se koristiti zadani raspored bez prilagođene izjave)";
    const auth =
      certificateConfig.authorityName.trim() !== ""
        ? `${certificateConfig.authorityName.trim()}${certificateConfig.authorityTitle.trim() ? ` — ${certificateConfig.authorityTitle.trim()}` : ""}`
        : null;
    return { title, body, auth, validityYears: certificateConfig.validityYears };
  }, [certificateConfig, courseTitle]);

  const passCalc =
    examConfig.questionsCount > 0
      ? Math.round((examConfig.passingScorePct / 100) * examConfig.questionsCount)
      : 0;

  const lessonTabContent =
    !lesson ? (
      <p className="text-xs text-text-muted">Odaberi lekciju u stablu s lijeve strane.</p>
    ) : (
      <div className="space-y-5 text-sm">
        <div>
          <p className="text-xs text-text-muted">Tip sadržaja</p>
          <p className="mt-1 font-medium text-text-primary">{TYPE_LABELS[lesson.contentType]}</p>
        </div>
        <div>
          <Label className="text-text-muted">Trajanje (min)</Label>
          <Input
            type="number"
            min={1}
            value={lesson.durationMinutes}
            disabled={!lesson.durationManual}
            onChange={(e) =>
              patchLesson(lesson.id, { durationMinutes: Number(e.target.value) || 1 })
            }
            className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
            <Checkbox
              checked={lesson.durationManual}
              onCheckedChange={(c) => patchLesson(lesson.id, { durationManual: c === true })}
            />
            Ručni override (inače auto iz sadržaja)
          </label>
        </div>
        <label className="flex items-center justify-between gap-2 text-text-secondary">
          <span>Vidljiva</span>
          <Checkbox
            checked={lesson.visible}
            onCheckedChange={(c) => patchLesson(lesson.id, { visible: c === true })}
          />
        </label>
        <label className="flex items-center justify-between gap-2 text-text-secondary">
          <span>Obavezna</span>
          <Checkbox
            checked={lesson.required}
            onCheckedChange={(c) => patchLesson(lesson.id, { required: c === true })}
          />
        </label>

        <Separator className="bg-border/30" />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Resursi</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                patchLesson(lesson.id, {
                  resources: [...lesson.resources, { id: generateId(), name: "Nov resurs" }],
                });
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="space-y-1.5">
            {lesson.resources.map((r) => (
              <li key={r.id} className="flex items-center gap-1">
                <Input
                  value={r.name}
                  onChange={(e) =>
                    patchLesson(lesson.id, {
                      resources: lesson.resources.map((x) =>
                        x.id === r.id ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                  className="h-8 flex-1 border-border/40 bg-surface-secondary text-xs"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() =>
                    patchLesson(lesson.id, {
                      resources: lesson.resources.filter((x) => x.id !== r.id),
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {courseCertifiable ? (
          <>
            <Separator className="bg-border/30" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Ispit (kurs)
              </h3>
              <div className="mt-3 space-y-2">
                <div>
                  <Label className="text-text-muted">Broj pitanja</Label>
                  <Input
                    type="number"
                    min={1}
                    value={examConfig.questionsCount}
                    onChange={(e) =>
                      patchExamConfig({ questionsCount: Number(e.target.value) || 1 })
                    }
                    className="mt-1 h-8 border-border/40 bg-surface-secondary"
                  />
                </div>
                <div>
                  <Label className="text-text-muted">Prolaznost %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={examConfig.passingScorePct}
                    onChange={(e) =>
                      patchExamConfig({ passingScorePct: Number(e.target.value) || 0 })
                    }
                    className="mt-1 h-8 border-border/40 bg-surface-secondary"
                  />
                </div>
                <div>
                  <Label className="text-text-muted">Pokušaji</Label>
                  <Input
                    type="number"
                    min={1}
                    value={examConfig.attemptsAllowed}
                    onChange={(e) =>
                      patchExamConfig({ attemptsAllowed: Number(e.target.value) || 1 })
                    }
                    className="mt-1 h-8 border-border/40 bg-surface-secondary"
                  />
                </div>
                <div>
                  <Label className="text-text-muted">Trajanje (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={examConfig.durationMinutes}
                    onChange={(e) =>
                      patchExamConfig({ durationMinutes: Number(e.target.value) || 1 })
                    }
                    className="mt-1 h-8 border-border/40 bg-surface-secondary"
                  />
                </div>
                <p className="rounded-md bg-brand/10 px-2 py-2 text-xs text-brand">
                  ≈
                  {passCalc}
                  /
                  {examConfig.questionsCount}
                  {" "}
                  tačnih za prolaz (
                  {examConfig.passingScorePct}
                  %)
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    );

  const certificateTab = (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-text-muted">
        Placeholderi u tekstu:{" "}
        <code className="rounded bg-surface-secondary px-1 text-[10px] text-brand">
          {"{fullName}"} {"{courseName}"} {"{score}"} {"{date}"}
        </code>
      </p>
      <div>
        <Label className="text-text-muted">Naslov certifikata</Label>
        <Input
          value={certificateConfig.certTitle}
          placeholder="POTVRDA O ZAVRŠENOJ OBUCI"
          onChange={(e) => patchCertificateConfig({ certTitle: e.target.value })}
          className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
        />
      </div>
      <div>
        <Label className="text-text-muted">Izjava (glavni tekst)</Label>
        <textarea
          value={certificateConfig.certStatement}
          onChange={(e) => patchCertificateConfig({ certStatement: e.target.value })}
          rows={8}
          placeholder="Npr. Ovime se potvrđuje da je {fullName} uspješno završio/la obuku {courseName}. Rezultat ispita: {score}. Datum: {date}."
          className="mt-1 w-full resize-y rounded-md border border-border/40 bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </div>
      <div>
        <Label className="text-text-muted">Ime ovlaštene osobe</Label>
        <Input
          value={certificateConfig.authorityName}
          onChange={(e) => patchCertificateConfig({ authorityName: e.target.value })}
          className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
        />
      </div>
      <div>
        <Label className="text-text-muted">Titula / uloga</Label>
        <Input
          value={certificateConfig.authorityTitle}
          onChange={(e) => patchCertificateConfig({ authorityTitle: e.target.value })}
          className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
        />
      </div>
      <div>
        <Label className="text-text-muted">Važnost (godine)</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={certificateConfig.validityYears}
          onChange={(e) =>
            patchCertificateConfig({
              validityYears: Math.min(100, Math.max(1, Number(e.target.value) || 1)),
            })
          }
          className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-border/50"
        onClick={() => setPreviewOpen(true)}
      >
        <Eye className="mr-2 h-4 w-4" />
        Pregled
      </Button>
    </div>
  );

  return (
    <>
      <aside className="flex min-w-[20rem] w-80 shrink-0 flex-col border-l border-border/20 bg-surface-primary">
        <div className="border-b border-border/20 px-3 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Uređivač kursa
          </h2>
        </div>
        <Tabs defaultValue="lesson" className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lesson" className="text-xs">
              Lekcija
            </TabsTrigger>
            <TabsTrigger value="certificate" className="text-xs">
              Sertifikat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lesson" className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {lessonTabContent}
          </TabsContent>
          <TabsContent value="certificate" className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {certificateTab}
          </TabsContent>
        </Tabs>
      </aside>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pregled certifikata</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border-2 border-brand/40 bg-surface-primary/80 p-6 text-center shadow-inner">
            <p className="text-lg font-bold tracking-tight text-brand">{previewResolved.title}</p>
            <p className="mt-4 whitespace-pre-wrap text-left text-sm leading-relaxed text-text-secondary">
              {previewResolved.body}
            </p>
            {previewResolved.auth ? (
              <p className="mt-6 text-xs text-text-muted">Ovlašteni potpisnik: {previewResolved.auth}</p>
            ) : null}
            <p className="mt-2 text-xs text-text-muted">
              Važnost: {previewResolved.validityYears} godine (primjer)
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Dummy podaci za prikaz. Stvarni PDF koristi podatke polaznika i sesije.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
