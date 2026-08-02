"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";

import { useDebouncedLessonPatch } from "@/admin/content-editor/lib/debouncedPatch";
import { CAPTION_LANGUAGE_OPTIONS } from "@/admin/content-editor/lib/captionLanguages";
import { useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import type { EditorLesson } from "@/admin/content-editor/types";
import { EmbedHostedVideo } from "@/components/EmbedHostedVideo";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { draftTranscriptFromVideo } from "@/lib/admin-course-a11y-api";
import { getVideoEmbedUrl } from "@/lib/videoEmbedUrl";

function vttPreviewUrl(inline: string, url: string): string | null {
  if (inline.trim()) {
    return URL.createObjectURL(new Blob([inline], { type: "text/vtt" }));
  }
  if (url.trim()) {
    return url.trim();
  }
  return null;
}

export function VideoLessonEditor({
  lesson,
  courseId,
}: {
  readonly lesson: EditorLesson;
  readonly courseId?: string;
}): JSX.Element {
  const patchLesson = useContentEditorStore((s) => s.patchLesson);
  const { schedule, flushPending } = useDebouncedLessonPatch(lesson.id, patchLesson);
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;
  const flushRef = useRef(flushPending);
  flushRef.current = flushPending;

  const [draft, setDraft] = useState(lesson.videoUrl);
  const [captionsUrl, setCaptionsUrl] = useState(lesson.captionsUrl);
  const [captionsInline, setCaptionsInline] = useState(lesson.captionsInline);
  const [transcriptUrl, setTranscriptUrl] = useState(lesson.transcriptUrl);
  const [transcriptInline, setTranscriptInline] = useState(lesson.transcriptInline);
  const [transcriptAi, setTranscriptAi] = useState(lesson.transcriptIsAiGenerated);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [attestLangs, setAttestLangs] = useState<string[]>(
    [...(lesson.embedCaptionAttestation?.captionLanguages ?? [])],
  );
  const [vttError, setVttError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(lesson.videoUrl);
    setCaptionsUrl(lesson.captionsUrl);
    setCaptionsInline(lesson.captionsInline);
    setTranscriptUrl(lesson.transcriptUrl);
    setTranscriptInline(lesson.transcriptInline);
    setTranscriptAi(lesson.transcriptIsAiGenerated);
    setAttestLangs([...(lesson.embedCaptionAttestation?.captionLanguages ?? [])]);
    setAiDraft(null);
  }, [lesson.id, lesson.videoUrl, lesson.captionsUrl, lesson.captionsInline, lesson.transcriptUrl, lesson.transcriptInline, lesson.transcriptIsAiGenerated, lesson.embedCaptionAttestation]);

  const embedSrc = getVideoEmbedUrl(draft);
  const isEmbed = Boolean(embedSrc);
  const vttUrl = useMemo(
    () => vttPreviewUrl(captionsInline, captionsUrl),
    [captionsInline, captionsUrl],
  );

  useEffect(() => {
    if (!vttUrl || !vttUrl.startsWith("blob:")) {
      setVttError(null);
      return;
    }
    let cancelled = false;
    void fetch(vttUrl)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        if (!text.trim().startsWith("WEBVTT")) {
          setVttError("VTT datoteka ne sadrži WEBVTT zaglavlje.");
        } else {
          setVttError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setVttError("VTT datoteka se ne može učitati.");
      });
    return () => {
      cancelled = true;
    };
  }, [vttUrl]);

  const attestationDate = lesson.embedCaptionAttestation?.attestedAt
    ? new Date(lesson.embedCaptionAttestation.attestedAt).toLocaleDateString()
    : null;

  const attestationDaysLeft = useMemo(() => {
    if (!isEmbed) return null;
    const expRaw = lesson.embedCaptionAttestation?.attestationExpiresAt;
    if (!expRaw) {
      if (!lesson.embedCaptionAttestation?.attestedAt) return 0;
      const att = new Date(lesson.embedCaptionAttestation.attestedAt);
      att.setUTCDate(att.getUTCDate() + 90);
      return Math.max(0, Math.ceil((att.getTime() - Date.now()) / 86_400_000));
    }
    return Math.max(0, Math.ceil((new Date(expRaw).getTime() - Date.now()) / 86_400_000));
  }, [isEmbed, lesson.embedCaptionAttestation]);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={`video-url-${lesson.id}`} className="text-text-muted">
          URL videa (YouTube, Vimeo ili direktan link)
        </Label>
        <Input
          id={`video-url-${lesson.id}`}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            scheduleRef.current({ videoUrl: v });
          }}
          onBlur={() => flushRef.current()}
          placeholder="https://www.youtube.com/watch?v=…"
          className="mt-1.5 border-border/40 bg-surface-secondary text-text-primary"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border/40 p-4">
        <h4 className="text-sm font-medium text-text-primary">Titlovi (.vtt) — WCAG 1.2.2</h4>
        <div>
          <Label htmlFor={`captions-url-${lesson.id}`} className="text-xs text-text-muted">
            URL titlova
          </Label>
          <Input
            id={`captions-url-${lesson.id}`}
            value={captionsUrl}
            onChange={(e) => {
              const v = e.target.value;
              setCaptionsUrl(v);
              scheduleRef.current({ captionsUrl: v });
            }}
            onBlur={() => flushRef.current()}
            placeholder="https://…/lesson.vtt"
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
        <div>
          <Label htmlFor={`captions-file-${lesson.id}`} className="text-xs text-text-muted">
            Ili učitaj .vtt
          </Label>
          <Input
            id={`captions-file-${lesson.id}`}
            type="file"
            accept=".vtt,text/vtt"
            className="mt-1 border-border/40 bg-surface-secondary"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then((text) => {
                setCaptionsInline(text);
                scheduleRef.current({ captionsInline: text });
                flushRef.current();
              });
            }}
          />
        </div>
        {vttError ? <p className="text-xs text-red-600">{vttError}</p> : null}
      </div>

      {isEmbed && attestationDaysLeft !== null ? (
        <div
          role="status"
          className={
            attestationDaysLeft <= 14
              ? "rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
              : "rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-text-primary"
          }
        >
          {attestationDaysLeft === 0 ? (
            <p className="font-medium">Potvrda titlova je istekla — obnova je obavezna prije objave.</p>
          ) : (
            <p className="font-medium">
              Potvrda titlova ističe za{" "}
              <span className="tabular-nums">{attestationDaysLeft}</span>{" "}
              {attestationDaysLeft === 1 ? "dan" : "dana"} (90-dnevni ciklus, ISO §9.1.4).
            </p>
          )}
        </div>
      ) : null}

      {isEmbed ? (
        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <h4 className="text-sm font-medium">Ugradbeni video — potvrda titlova na hostu</h4>
          {attestationDate ? (
            <p className="text-xs text-text-muted">
              Potvrđeno {attestationDate}
              {lesson.embedCaptionAttestation?.attestationExpiresAt
                ? ` · ističe ${new Date(lesson.embedCaptionAttestation.attestationExpiresAt).toLocaleDateString()}`
                : ""}
            </p>
          ) : null}
          <fieldset>
            <legend className="text-xs text-text-muted">Jezici titlova na hostu</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CAPTION_LANGUAGE_OPTIONS.map((opt) => {
                const checked = attestLangs.includes(opt.code);
                return (
                  <label key={opt.code} className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? attestLangs.filter((c) => c !== opt.code)
                          : [...attestLangs, opt.code];
                        setAttestLangs(next);
                        const now = new Date();
                        const exp = new Date(now);
                        exp.setUTCDate(exp.getUTCDate() + 90);
                        scheduleRef.current({
                          embedCaptionAttestation: {
                            attestedAt: now.toISOString(),
                            attestedBy: null,
                            attestationExpiresAt: exp.toISOString(),
                            captionLanguages: next,
                          },
                        });
                        flushRef.current();
                      }}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="text-xs text-text-muted">
            Označavanjem potvrđujete: „Titlovi postoje na hostu od {new Date().toLocaleDateString()}“ (90 dana).
          </p>
        </div>
      ) : null}

      <div className="space-y-3 rounded-lg border border-border/40 p-4">
        <h4 className="text-sm font-medium">Transkript — WCAG 1.2.3</h4>
        <textarea
          value={transcriptInline}
          onChange={(e) => {
            const v = e.target.value;
            setTranscriptInline(v);
            setTranscriptAi(false);
            scheduleRef.current({ transcriptInline: v, transcriptIsAiGenerated: false });
          }}
          onBlur={() => flushRef.current()}
          rows={6}
          className="w-full rounded-md border border-border/40 bg-surface-secondary px-3 py-2 text-sm"
          placeholder="Rich-text / plain transkript…"
        />
        <div>
          <Label htmlFor={`transcript-url-${lesson.id}`} className="text-xs text-text-muted">
            Ili URL (.txt / .html)
          </Label>
          <Input
            id={`transcript-url-${lesson.id}`}
            value={transcriptUrl}
            onChange={(e) => {
              const v = e.target.value;
              setTranscriptUrl(v);
              scheduleRef.current({ transcriptUrl: v });
            }}
            onBlur={() => flushRef.current()}
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
        {courseId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={aiLoading || !draft.trim()}
            onClick={() => {
              void (async () => {
                setAiLoading(true);
                try {
                  const res = await draftTranscriptFromVideo(courseId, lesson.id, { videoUrl: draft });
                  setAiDraft(res.transcript);
                } catch {
                  setAiDraft(null);
                } finally {
                  setAiLoading(false);
                }
              })();
            }}
          >
            {aiLoading ? "AI transkripcija…" : "Draft transcript from video (AI)"}
          </Button>
        ) : null}
        {aiDraft ? (
          <div className="rounded border border-primary/30 bg-primary/5 p-3 text-xs">
            <p className="font-medium text-primary">AI nacrt — pregledajte prije spremanja (ISO §6.5)</p>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{aiDraft}</pre>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setTranscriptInline(aiDraft);
                  setTranscriptAi(true);
                  scheduleRef.current({
                    transcriptInline: aiDraft,
                    transcriptIsAiGenerated: true,
                  });
                  flushRef.current();
                  setAiDraft(null);
                }}
              >
                Prihvati nacrt
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAiDraft(null)}>
                Odbaci
              </Button>
            </div>
          </div>
        ) : null}
        {transcriptAi ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">Transkript označen kao AI-generiran.</p>
        ) : null}
      </div>

      {embedSrc ? (
        <div>
          <p className="mb-2 text-xs text-text-muted">Pregled ugradnje</p>
          <EmbedHostedVideo
            src={embedSrc}
            title={lesson.title}
            transcriptUrl={transcriptUrl || undefined}
          />
        </div>
      ) : draft.trim() && vttUrl ? (
        <div className="overflow-hidden rounded-lg border border-border/40">
          <p className="border-b border-border/30 px-3 py-2 text-xs text-text-muted">
            Pregled titlova (Video.js)
          </p>
          <VideoPlayer
            videoUrl={draft}
            thumbnailUrl=""
            subtitles={[{ language: "hr", url: vttUrl }]}
            onProgress={() => {}}
            onComplete={() => {}}
            hideChapterButtons
          />
        </div>
      ) : null}
    </div>
  );
}
