import type { JSX, ReactNode } from "react";
import { Navigate } from "react-router";
import { canAccessCertificationApplicationsNav } from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

export function CertificationGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const authenticated = useAuthStore((s) => s.isAuthenticated && Boolean(s.accessToken)); const role = useAuthStore((s) => s.user?.role); const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  if (!authenticated) return <Navigate to="/login?reason=session" replace />;
  return canAccessCertificationApplicationsNav({ role, cognitoGroups }) ? <>{children}</> : <Navigate to="/unauthorized" replace />;
}
