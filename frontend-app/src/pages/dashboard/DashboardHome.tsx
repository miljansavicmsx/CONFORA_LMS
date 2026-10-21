import type { JSX } from "react";
import { useOutletContext } from "react-router";

import { LearnerDashboard } from "@/components/learning/LearnerDashboard";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

export default function DashboardHome(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  return <LearnerDashboard learnerName={user.name ?? user.email ?? ""} />;
}
