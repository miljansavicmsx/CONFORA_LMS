import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateCourseCreatorAccess } from "@/lib/course-creator-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** training_admin, admin ili sys_admin — strože od CurriculumGuard za „Kreiranje obuke“. */
export function CourseCreatorGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateCourseCreatorAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
