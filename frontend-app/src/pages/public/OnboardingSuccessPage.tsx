import { type JSX } from "react";
import { useSearchParams } from "react-router";

export default function OnboardingSuccessPage(): JSX.Element {
  const [params] = useSearchParams();
  return (
    <section aria-labelledby="onboarding-success-heading" className="mx-auto max-w-xl px-6 py-12">
      <h1 id="onboarding-success-heading" className="text-3xl font-bold text-text-primary">
        Onboarding submitted
      </h1>
      <p className="mt-2 text-text-secondary">Lead ID: {params.get("leadId") ?? "—"}</p>
    </section>
  );
}

