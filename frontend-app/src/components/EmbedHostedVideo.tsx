"use client";

import { useId, type JSX } from "react";

import { cn } from "@/lib/utils";

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";

/**
 * YouTube (nocookie) / Vimeo ugradnja. Izvorni URL mora već biti embed oblik (vidi getVideoEmbedUrl).
 * Sandbox: dovoljno za reprodukciju, bez top-level navigacije iz iframe-a.
 */
export function EmbedHostedVideo({
  src,
  title,
  immersive = false,
  className,
  transcriptUrl,
}: {
  readonly src: string;
  readonly title: string;
  readonly immersive?: boolean;
  readonly className?: string;
  /** Tekstualni transkript lekcije (poveznica). */
  readonly transcriptUrl?: string;
}): JSX.Element {
  const noteId = useId();
  return (
    <figure className={cn("space-y-2", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-md shadow-sm",
          immersive
            ? "border border-border/30 bg-black/30 ring-1 ring-white/5"
            : "border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30",
        )}
        aria-describedby={noteId}
      >
        <div className="aspect-video w-full">
          <iframe
            title={title}
            src={src}
            className="h-full w-full border-0"
            allow={IFRAME_ALLOW}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
      <figcaption id={noteId} className="text-xs leading-snug text-[hsl(var(--muted-foreground))]">
        Ugradbeni player (YouTube/Vimeo): uredite titlove i opis zvuka na hostu kako bi ispunili WCAG 1.2.2.
        {transcriptUrl ? (
          <>
            {" "}
            <a
              href={transcriptUrl}
              className="font-medium text-[hsl(var(--primary))] underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Transkript lekcije
            </a>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
