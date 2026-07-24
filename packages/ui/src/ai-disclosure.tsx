import type { HTMLAttributes, ReactNode } from 'react';

type AiDisclosureBaseProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Compact pill vs a short banner (layout only; copy is always consumer-supplied). */
  variant?: 'pill' | 'banner';
  /**
   * Optional decorative mark. Omit by default; do not hardcode product English.
   * When provided, rendered `aria-hidden`; the `message` / `children` carry disclosure meaning.
   */
  mark?: string;
};

/**
 * Visible text must come from product i18n. Pass `message` and/or `children`
 * (children take precedence). At least one is required.
 */
export type AiDisclosureProps = AiDisclosureBaseProps &
  (
    | { message: string; children?: ReactNode }
    | { message?: undefined; children: ReactNode }
  );

/**
 * Presentational AI-assistance disclosure (ISO transparency / CONFORA AI governance).
 *
 * Product copy supplied via `message` / `children` SHOULD convey meaning equivalent to:
 * - AI assists only.
 * - Human oversight remains required.
 * - AI does not make certification decisions.
 * - AI does not grant certification, issue certificates, or replace reviewer /
 *   committee / decision-maker oversight.
 * - Certification decisions remain controlled by the approved certification workflow.
 *
 * This component is presentational only: no network, storage, DOM APIs,
 * auth/RBAC/tenant logic, or business decisions.
 */
export function AiDisclosure({
  variant = 'pill',
  className = '',
  message,
  mark,
  children,
  ...rest
}: AiDisclosureProps) {
  const base =
    variant === 'banner'
      ? 'cf-w-full cf-rounded-md cf-border cf-border-violet-200 cf-bg-violet-50 cf-px-3 cf-py-2 cf-text-sm cf-text-slate-800'
      : 'cf-inline-flex cf-items-center cf-gap-1 cf-rounded-full cf-border cf-border-violet-200 cf-bg-violet-50 cf-px-2.5 cf-py-0.5 cf-text-xs cf-font-medium cf-text-violet-900';

  const visible = children ?? message;

  return (
    <div
      role="note"
      className={`${base} ${className}`.trim()}
      data-ai-disclosure="true"
      data-ai-assistive-only="true"
      {...rest}
    >
      {mark ? (
        <span className="cf-font-semibold cf-text-violet-800" aria-hidden>
          {mark}
        </span>
      ) : null}
      <span>{visible}</span>
    </div>
  );
}
