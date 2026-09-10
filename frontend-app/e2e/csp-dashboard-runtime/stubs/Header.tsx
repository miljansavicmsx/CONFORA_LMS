import { createElement, type JSX, type ReactNode } from "react";

export type HeaderNotification = { readonly id: string; readonly title: string };
export type HeaderQuickAction = { readonly id: string; readonly label: string };

/** Harness stub — real DashboardLayout still imports this module path. */
export function Header(props: {
  readonly user: { readonly name: string };
  readonly onMobileNavOpen?: () => void;
}): JSX.Element {
  return createElement(
    "header",
    { "data-testid": "harness-header" },
    createElement(
      "button",
      { type: "button", "data-testid": "harness-mobile-nav", onClick: props.onMobileNavOpen },
      "Menu",
    ),
    createElement("span", null, props.user.name),
  );
}

void (null as unknown as ReactNode);
