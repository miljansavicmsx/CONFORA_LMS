import { useState, type JSX } from "react";
import { useNavigate } from "react-router";

import { requestDemo, startTrial } from "@/lib/api-onboarding";

export default function OnboardingPage(): JSX.Element {
  const nav = useNavigate();
  const [form, setForm] = useState({
    organizationType: "certification_body",
    useCase: "certification_lifecycle",
    organizationName: "",
    email: "",
    plan: "professional",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async (mode: "demo" | "trial"): Promise<void> => {
    setError(null);
    try {
      const out = mode === "demo" ? await requestDemo(form) : await startTrial(form);
      nav(`/onboarding/success?leadId=${encodeURIComponent(out.leadId)}`);
    } catch {
      setError("Onboarding request failed. Please try again.");
    }
  };

  return (
    <section aria-labelledby="onboarding-heading" className="mx-auto max-w-2xl px-6 py-12">
      <h1 id="onboarding-heading" className="text-3xl font-bold text-text-primary">
        Pilot Onboarding
      </h1>
      <p className="mt-2 text-text-secondary">Choose organization profile and start a guided trial or demo process.</p>
      <div className="mt-6 grid gap-3">
        <input className="h-10 rounded border border-border/60 px-3" placeholder="Organization name" value={form.organizationName} onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))} />
        <input className="h-10 rounded border border-border/60 px-3" placeholder="Business email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded bg-brand px-4 py-2 text-white" onClick={() => void submit("demo")}>Request demo</button>
        <button className="rounded border border-border/60 px-4 py-2" onClick={() => void submit("trial")}>Start trial</button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

