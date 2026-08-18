import type { JSX } from "react";
import { useOutletContext } from "react-router";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

export default function DashboardHome(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  return <main id="main-content" className="mx-auto max-w-5xl px-4 py-8"><h1 className="text-2xl font-bold">Dashboard</h1><p className="mt-2 text-text-secondary">{user.name ?? user.email ?? "Signed-in workspace"}</p></main>;
}
