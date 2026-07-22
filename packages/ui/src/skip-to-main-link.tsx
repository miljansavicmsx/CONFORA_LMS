import type { JSX, ReactNode } from 'react';

export interface SkipToMainLinkProps {
  /** DOM id of the primary content landmark (default `main-content`). */
  readonly targetId?: string;
  /** Visible link text when `children` is not provided (overridable per app/tenant). */
  readonly label?: string;
  /** Optional override for link text (takes precedence over `label`). */
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * WCAG 2.4.1 Bypass Blocks — first focusable control; visible on keyboard focus only.
 */
export function SkipToMainLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  children,
  className = '',
}: SkipToMainLinkProps): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className={
        'cf-skip-link cf-absolute cf-left-4 cf-top-0 cf-z-[200] -cf-translate-y-full ' +
        'cf-rounded-md cf-border cf-border-white/30 cf-bg-slate-900 cf-px-4 cf-py-2 cf-text-sm cf-font-semibold ' +
        'cf-text-white cf-shadow-lg cf-transition-transform cf-duration-150 ' +
        'focus:cf-translate-y-4 focus:cf-outline-none focus:cf-ring-2 focus:cf-ring-sky-400 focus:cf-ring-offset-2 ' +
        'focus:cf-ring-offset-slate-950 ' +
        className
      }
    >
      {children ?? label}
    </a>
  );
}
