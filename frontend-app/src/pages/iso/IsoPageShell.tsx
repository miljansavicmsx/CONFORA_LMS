import type { ComponentType, JSX, ReactNode } from "react";

export function IsoPageShell({ icon: Icon, title, description, children }: { readonly icon?: ComponentType<{ readonly className?: string; readonly 'aria-hidden'?: boolean }>; readonly title: string; readonly description: string; readonly children: ReactNode }): JSX.Element {
  return <main id="main-content" className="mx-auto max-w-7xl px-4 py-8"><header className="mb-6 flex gap-3">{Icon ? <Icon className="mt-1 h-6 w-6 text-brand" aria-hidden /> : null}<div><h1 className="text-2xl font-bold text-text-primary">{title}</h1><p className="mt-1 text-sm text-text-secondary">{description}</p></div></header>{children}</main>;
}
