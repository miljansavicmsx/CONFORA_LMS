import { memo, type JSX } from "react";

import { cn } from "@/lib/utils";
import type { ConforaLogoMode, ConforaLogoVariant } from "@/utils/exportLogo";

export type { ConforaLogoMode, ConforaLogoVariant } from "@/utils/exportLogo";

export type ConforaLogoProps = {
  readonly className?: string;
  readonly variant?: ConforaLogoVariant;
  readonly size?: "sm" | "md" | "lg";
  readonly mode?: ConforaLogoMode;
  /** Kad je unutar linka s vlastitim `aria-label`, ukloni dupli najavni tekst. */
  readonly presentational?: boolean;
};

const SIZE_CLASS: Record<NonNullable<ConforaLogoProps["size"]>, string> = {
  sm: "h-6 w-auto",
  md: "h-10 w-auto",
  lg: "h-16 w-auto",
};

function IconMarkFull(): JSX.Element {
  return (
    <g aria-hidden>
      <path
        fill="currentColor"
        d="M8 6h7v20H8a2 2 0 01-2-2V8a2 2 0 012-2zm9 0h7a2 2 0 012 2v16a2 2 0 01-2 2h-7V6z"
      />
      <path d="M16 6v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="7.5" r="2" fill="currentColor" />
      <path
        d="M10 18l2.5 2.5L15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IconMarkCompact(): JSX.Element {
  const stroke = 2;
  return (
    <g aria-hidden>
      <rect
        x={4}
        y={14}
        width={11}
        height={14}
        rx={2}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <rect
        x={17}
        y={14}
        width={11}
        height={14}
        rx={2}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <circle cx={16} cy={10} r={4} fill="currentColor" />
    </g>
  );
}

const ConforaLogoInner = memo(function ConforaLogoInner({
  className,
  variant,
  size = "md",
  mode = "full",
  presentational = false,
}: ConforaLogoProps): JSX.Element {
  const variantClass =
    variant === "dark"
      ? "text-[#071a3d]"
      : variant === "light"
        ? "text-white"
        : "text-[#071a3d] dark:text-white";

  const a11y = presentational
    ? { role: "presentation" as const, "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": "CONFORA logo" as const };

  if (mode === "icon") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className={cn(SIZE_CLASS[size], "max-w-none shrink-0", variantClass, className)}
        {...a11y}
      >
        <IconMarkCompact />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 148 32"
      className={cn(SIZE_CLASS[size], "max-w-none shrink-0", variantClass, className)}
      {...a11y}
    >
      <IconMarkFull />
      <text
        x={40}
        y={23}
        fill="currentColor"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontSize={17}
        fontWeight={700}
        letterSpacing="-0.03em"
        aria-hidden
      >
        CONFORA
      </text>
    </svg>
  );
});

export const ConforaLogo = ConforaLogoInner;
