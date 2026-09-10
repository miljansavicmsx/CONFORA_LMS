import { createElement, type JSX, type ReactNode } from "react";

/** E2E/test-local stub — not a production Tooltip implementation. */
export function TooltipProvider(props: {
  readonly delayDuration?: number;
  readonly children?: ReactNode;
}): JSX.Element {
  return createElement("div", { "data-testid": "stub-tooltip-provider" }, props.children);
}
