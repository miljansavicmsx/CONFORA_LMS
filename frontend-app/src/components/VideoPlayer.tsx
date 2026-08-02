import { useCallback, useEffect, useRef, type JSX } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "./VideoPlayer.confora.css";

export interface VideoPlayerProps {
  readonly videoUrl: string;
  readonly thumbnailUrl: string;
  readonly chapters?: ReadonlyArray<{ timeSeconds: number; title: string }>;
  readonly subtitles?: ReadonlyArray<{ language: string; url: string }>;
  readonly completionThresholdPct?: number;
  readonly lastPositionSeconds?: number;
  readonly onProgress: (positionSeconds: number, watchedPct: number) => void;
  readonly onComplete: () => void;
  /** Za debounced PUT /api/learning/progress/{lessonId} (bookmark). */
  readonly lessonId?: string;
  readonly className?: string;
  /** Tamni cinema player + brand scrubber (D.7). */
  readonly immersive?: boolean;
  /** Sakrij listu tipki poglavlja ispod playera (marker i dalje na traci). */
  readonly hideChapterButtons?: boolean;
  /** Poveznica na puna tekstualna verzija (titrani + transkript kao alternativa u autoringu). */
  readonly transcriptUrl?: string;
}

function sourceTypeForUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes(".m3u8")) {
    return "application/x-mpegURL";
  }
  if (u.includes(".mpd")) {
    return "application/dash+xml";
  }
  return "video/mp4";
}

function formatVttTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const whole = Math.floor(s);
  const ms = Math.round((s - whole) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${whole.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

function formatChapterChip(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildChaptersVtt(
  chapters: ReadonlyArray<{ timeSeconds: number; title: string }>,
  durationSeconds: number,
): string {
  const sorted = [...chapters].sort((a, b) => a.timeSeconds - b.timeSeconds);
  let body = "WEBVTT\n\n";
  const endCap = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 86400;
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (!cur) {
      continue;
    }
    const start = Math.max(0, cur.timeSeconds);
    const next = sorted[i + 1];
    const end = next ? Math.max(start + 0.001, next.timeSeconds) : endCap;
    const title = cur.title.replace(/\n/g, " ").trim();
    body += `${formatVttTime(start)} --> ${formatVttTime(end)}\n${title}\n\n`;
  }
  return body;
}

const PROGRESS_INTERVAL_MS = 5000;
const BOOKMARK_DEBOUNCE_MS = 10_000;

type VjsPlayer = ReturnType<typeof videojs>;

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  chapters,
  subtitles,
  completionThresholdPct = 90,
  lastPositionSeconds,
  onProgress,
  onComplete,
  lessonId,
  className,
  immersive = false,
  hideChapterButtons = false,
  transcriptUrl,
}: VideoPlayerProps): JSX.Element {
  const videoElRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VjsPlayer | null>(null);

  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  const lastReportAtRef = useRef(0);
  const maxWatchedRef = useRef(0);
  const completedRef = useRef(false);
  const bookmarkTimerRef = useRef<number | null>(null);
  const pendingBookmarkSecRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const chaptersBlobUrlRef = useRef<string | null>(null);

  const scheduleBookmarkSave = useCallback(
    (positionSeconds: number) => {
      if (!lessonId) {
        return;
      }
      pendingBookmarkSecRef.current = positionSeconds;
      if (bookmarkTimerRef.current !== null) {
        window.clearTimeout(bookmarkTimerRef.current);
      }
      bookmarkTimerRef.current = window.setTimeout(() => {
        bookmarkTimerRef.current = null;
        const sec = Math.floor(pendingBookmarkSecRef.current);
        void api
          .put(`/api/learning/progress/${encodeURIComponent(lessonId)}`, { last_position_seconds: sec })
          .catch(() => {
            /* backend možda još nema rutu */
          });
      }, BOOKMARK_DEBOUNCE_MS);
    },
    [lessonId],
  );

  const resetBookmarkDebounce = useCallback(() => {
    if (bookmarkTimerRef.current !== null) {
      window.clearTimeout(bookmarkTimerRef.current);
      bookmarkTimerRef.current = null;
    }
  }, []);

  const flushBookmark = useCallback(() => {
    if (!lessonId) {
      return;
    }
    resetBookmarkDebounce();
    const sec = Math.floor(pendingBookmarkSecRef.current);
    void api
      .put(`/api/learning/progress/${encodeURIComponent(lessonId)}`, { last_position_seconds: sec })
      .catch(() => {});
  }, [lessonId, resetBookmarkDebounce]);

  useEffect(() => {
    completedRef.current = false;
    maxWatchedRef.current = 0;
    lastReportAtRef.current = 0;
    resetBookmarkDebounce();
  }, [videoUrl, resetBookmarkDebounce]);

  useEffect(() => {
    const el = videoElRef.current;
    if (!el) {
      return;
    }

    const player = videojs(el, {
      controls: true,
      fluid: true,
      responsive: true,
      preload: "auto",
      poster: thumbnailUrl || undefined,
      playbackRates: [0.75, 1, 1.25, 1.5, 2],
      userActions: {
        hotkeys: false,
      },
      html5: {
        vhs: {
          overrideNative: !videojs.browser.IS_ANY_SAFARI,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      controlBar: {
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "customControlSpacer",
          "playbackRateMenuButton",
          "chaptersButton",
          "subsCapsButton",
          "pictureInPictureToggle",
          "fullscreenToggle",
        ],
      },
      sources: [{ src: videoUrl, type: sourceTypeForUrl(videoUrl) }],
    });

    player.addClass("confora-video-js");
    if (immersive) {
      player.addClass("confora-video-js--immersive");
    }

    const root = player.el();
    if (!root) {
      player.dispose();
      return () => {};
    }
    root.setAttribute("tabindex", "0");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Video player — razmak za reprodukciju, strelice za premotavanje, M za utišavanje");

    let chaptersTrackAdded = false;
    const tryAddChaptersTrack = () => {
      if (chaptersTrackAdded || !chapters?.length) {
        return;
      }
      const d = player.duration();
      if (d === undefined || !Number.isFinite(d) || d <= 0 || d === Number.POSITIVE_INFINITY) {
        return;
      }
      chaptersTrackAdded = true;
      if (chaptersBlobUrlRef.current) {
        URL.revokeObjectURL(chaptersBlobUrlRef.current);
        chaptersBlobUrlRef.current = null;
      }
      const vtt = buildChaptersVtt(chapters, d);
      const blob = new Blob([vtt], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      chaptersBlobUrlRef.current = url;
      player.addRemoteTextTrack(
        {
          kind: "chapters",
          src: url,
          label: "Poglavlja",
          language: "hr",
          default: false,
        },
        false,
      );
    };

    const seekBookmark = () => {
      if (lastPositionSeconds !== undefined && lastPositionSeconds > 0) {
        try {
          player.currentTime(lastPositionSeconds);
        } catch {
          /* ignore */
        }
      }
    };

    const clearChapterMarkers = () => {
      const holder = root.querySelector(".vjs-progress-holder");
      holder?.querySelectorAll(".cf-vjs-chapter-marker").forEach((n) => n.remove());
    };

    const mountChapterMarkers = () => {
      clearChapterMarkers();
      if (!immersive || !chapters?.length) {
        return;
      }
      const holder = root.querySelector(".vjs-progress-holder");
      if (!holder) {
        return;
      }
      const dur = player.duration();
      if (typeof dur !== "number" || !Number.isFinite(dur) || dur <= 0) {
        return;
      }
      for (const ch of chapters) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cf-vjs-chapter-marker";
        btn.style.left = `${(Math.min(Math.max(0, ch.timeSeconds), dur) / dur) * 100}%`;
        btn.title = ch.title;
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          player.currentTime(Math.min(ch.timeSeconds, dur));
          try {
            const r = player.play();
            if (r !== undefined) {
              void Promise.resolve(r).catch(() => {});
            }
          } catch {
            /* ignore */
          }
        });
        btn.setAttribute("aria-label", `Skoči na poglavlje: ${ch.title}`);
        holder.appendChild(btn);
      }
    };

    player.on("loadedmetadata", () => {
      seekBookmark();
      tryAddChaptersTrack();
      mountChapterMarkers();
    });
    player.on("durationchange", () => {
      tryAddChaptersTrack();
      mountChapterMarkers();
    });

    if (subtitles?.length) {
      subtitles.forEach((sub, i) => {
        player.addRemoteTextTrack(
          {
            kind: "subtitles",
            src: sub.url,
            label: sub.language,
            srclang: sub.language.slice(0, 2) || "und",
            default: i === 0,
          },
          false,
        );
      });
    }

    const onTimeUpdate = () => {
      const t = player.currentTime();
      const dur = player.duration();
      if (typeof t === "number" && Number.isFinite(t) && t >= 0) {
        maxWatchedRef.current = Math.max(maxWatchedRef.current, t);
        scheduleBookmarkSave(t);
      }
      if (typeof dur !== "number" || !Number.isFinite(dur) || dur <= 0) {
        return;
      }
      const watchedPct = Math.min(100, (maxWatchedRef.current / dur) * 100);
      const now = Date.now();
      if (typeof t === "number" && Number.isFinite(t) && now - lastReportAtRef.current >= PROGRESS_INTERVAL_MS) {
        lastReportAtRef.current = now;
        onProgressRef.current(Math.floor(t), Math.round(watchedPct * 10) / 10);
      }
      if (!completedRef.current && watchedPct >= completionThresholdPct) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    };

    player.on("timeupdate", onTimeUpdate);

    const onVis = () => {
      if (document.hidden) {
        wasPlayingRef.current = !player.paused();
        player.pause();
      } else if (wasPlayingRef.current) {
        void Promise.resolve(player.play()).catch(() => {
          wasPlayingRef.current = false;
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const hotkeyHandler = (e: Event) => {
      if (!(e instanceof KeyboardEvent) || e.defaultPrevented) {
        return;
      }
      const target = e.target;
      if (!(target instanceof Node) || !root.contains(target)) {
        return;
      }
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          if (player.paused()) {
            void Promise.resolve(player.play()).catch(() => {});
          } else {
            player.pause();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          {
            const ct = player.currentTime();
            if (typeof ct === "number" && Number.isFinite(ct)) {
              player.currentTime(Math.max(0, ct - 5));
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          {
            const ct = player.currentTime();
            const duration = player.duration();
            if (typeof ct !== "number" || !Number.isFinite(ct)) {
              break;
            }
            const next =
              typeof duration === "number" && Number.isFinite(duration)
                ? Math.min(duration, ct + 5)
                : ct + 5;
            player.currentTime(next);
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          player.muted(!player.muted());
          break;
        default:
          break;
      }
    };
    root.addEventListener("keydown", hotkeyHandler);

    playerRef.current = player;

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      root.removeEventListener("keydown", hotkeyHandler);
      clearChapterMarkers();
      flushBookmark();
      resetBookmarkDebounce();
      if (chaptersBlobUrlRef.current) {
        URL.revokeObjectURL(chaptersBlobUrlRef.current);
        chaptersBlobUrlRef.current = null;
      }
      player.dispose();
      playerRef.current = null;
    };
  }, [
    videoUrl,
    thumbnailUrl,
    chapters,
    subtitles,
    completionThresholdPct,
    lastPositionSeconds,
    scheduleBookmarkSave,
    resetBookmarkDebounce,
    flushBookmark,
    immersive,
  ]);

  const jumpToChapter = useCallback((seconds: number) => {
    const p = playerRef.current;
    if (!p) {
      return;
    }
    p.currentTime(Math.max(0, seconds));
    try {
      const result = p.play();
      if (result !== undefined) {
        void Promise.resolve(result).catch(() => {});
      }
    } catch {
      /* autoplay ili tech odbijen */
    }
  }, []);

  return (
    <div className={cn(immersive ? "space-y-0" : "space-y-3", className)}>
      <div
        className={cn(
          "overflow-hidden bg-black shadow-sm",
          immersive
            ? "aspect-video max-w-4xl rounded-xl border border-border/25"
            : "rounded-lg border border-[hsl(var(--border))]",
        )}
        data-vjs-player
      >
        <video
          ref={videoElRef}
          className="video-js vjs-big-play-centered vjs-fluid"
          playsInline
        />
      </div>

      {chapters && chapters.length > 0 && !hideChapterButtons ? (
        <nav className="flex flex-wrap gap-2" aria-label="Poglavlja na vremenskoj crti">
          {chapters.map((ch, idx) => (
            <Button
              key={`${ch.timeSeconds}-${idx}`}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => jumpToChapter(ch.timeSeconds)}
            >
              {formatChapterChip(ch.timeSeconds)}{" "}
              <span className="font-normal text-[hsl(var(--muted-foreground))]">— {ch.title}</span>
            </Button>
          ))}
        </nav>
      ) : null}

      {transcriptUrl ? (
        <p className="text-sm text-[hsl(var(--foreground))]">
          <a
            href={transcriptUrl}
            className="font-medium text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Transkript lekcije
          </a>
          <span className="text-[hsl(var(--muted-foreground))]"> — otvori u novoj kartici</span>
        </p>
      ) : (
        <p className={cn("text-xs leading-snug", immersive ? "text-text-muted" : "text-[hsl(var(--muted-foreground))]")}>
          Za WCAG usklađenost dodajte WebVTT titlove u autorskom modu i objavite transkript kada je dostupan.
        </p>
      )}
    </div>
  );
}
