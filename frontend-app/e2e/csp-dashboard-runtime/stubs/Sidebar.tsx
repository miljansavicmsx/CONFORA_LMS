import { createElement, type JSX } from "react";

export const SIDEBAR_WIDTH_EXPANDED = 280;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

export type SidebarUser = {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string | null;
  readonly title?: string | null;
};

/** Harness stub — preserves width constants required by real DashboardLayout. */
export function Sidebar(props: {
  readonly collapsed: boolean;
  readonly showCollapse: boolean;
  readonly user: SidebarUser;
  readonly onToggleCollapse: () => void;
}): JSX.Element {
  return createElement(
    "div",
    { "data-testid": "harness-sidebar", "data-collapsed": String(props.collapsed) },
    createElement(
      "button",
      { type: "button", "data-testid": "harness-sidebar-toggle", onClick: props.onToggleCollapse },
      props.collapsed ? "Expand" : "Collapse",
    ),
    createElement("span", null, props.user.name),
  );
}
