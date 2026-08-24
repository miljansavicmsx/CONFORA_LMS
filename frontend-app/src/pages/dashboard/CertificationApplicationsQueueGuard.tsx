import type { JSX, ReactNode } from "react";
import { CertificationGuard } from "./CertificationGuard";
export function CertificationApplicationsQueueGuard({ children }: { readonly children: ReactNode }): JSX.Element { return <CertificationGuard>{children}</CertificationGuard>; }
