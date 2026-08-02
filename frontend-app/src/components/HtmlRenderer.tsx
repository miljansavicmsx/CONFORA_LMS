import DOMPurify from "dompurify";
import type { Config } from "dompurify";
import { useMemo, type JSX } from "react";

import { cn } from "@/lib/utils";

/**
 * Ograničava HTML na ono što TipTap StarterKit tipično emitira (bez tablica, callouta, slike…).
 * XSS: uklanja skripte, događaje, javascript: URL-ove itd.
 */
export const TIPTAP_HTML_SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
};

export function HtmlRenderer({
  html,
  className,
  immersive = false,
}: {
  readonly html: string;
  readonly className?: string;
  readonly immersive?: boolean;
}): JSX.Element {
  const safeHtml = useMemo(
    () => DOMPurify.sanitize(html, TIPTAP_HTML_SANITIZE_CONFIG),
    [html],
  );

  return (
    <div
      className={cn(
        immersive
          ? "max-w-2xl px-2 text-sm leading-relaxed text-text-secondary [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_strong]:text-text-primary"
          : "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm leading-relaxed text-[hsl(var(--foreground))] shadow-sm [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_strong]:text-[#1F4E79]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
