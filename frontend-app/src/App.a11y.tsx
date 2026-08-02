import { A11ySkipToMainLink } from "@confora/i18n/react";
import { Suspense, type JSX } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { AppShellFallback } from "@/components/accessibility/AppShellFallback";
import Login from "@/pages/Login";
import LandingPage from "@/pages/public/LandingPage";
import VerifyCertificate from "@/pages/public/VerifyCertificate";
import VerifyLookupPage from "@/pages/public/VerifyLookupPage";

/**
 * R0-7D2S2 — accessibility public baseline router.
 * Production `App.tsx` is intentionally not imported.
 */
export default function AppA11y(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="relative min-h-svh">
        <A11ySkipToMainLink />
        <main id="main-content" tabIndex={-1} className="min-h-svh outline-none">
          <Suspense fallback={<AppShellFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<VerifyLookupPage />} />
              <Route path="/verify/:verificationHash" element={<VerifyCertificate />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
