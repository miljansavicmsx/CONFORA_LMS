import { createElement, type JSX, type ReactNode } from "react";

export type TooltipProviderProps = {
  readonly delayDuration?: number;
  readonly children: ReactNode;
};

/** Minimal TooltipProvider shim required by DashboardLayout / Sidebar. */
export function TooltipProvider({ children }: TooltipProviderProps): JSX.Element {
  return createElement("div", { "data-testid": "tooltip-provider" }, children);
}

export function Tooltip({ children }: { readonly children: ReactNode }): JSX.Element {
  return createElement("div", null, children);
}

export function TooltipTrigger({ children }: { readonly children: ReactNode }): JSX.Element {
  return createElement("div", null, children);
}

export function TooltipContent({ children }: { readonly children: ReactNode }): JSX.Element {
  return createElement("div", { role: "tooltip" }, children);
}
