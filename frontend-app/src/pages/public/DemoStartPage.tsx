import { useState, type JSX } from "react";
import { useNavigate } from "react-router";

import { api } from "@/lib/api";

export default function DemoStartPage(): JSX.Element {
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const onStart = async (): Promise<void> => {
    setError(null);
    try {
      const { data } = await api.post<{ demoId: string }>("/api/demo/start", { organizationName });
      nav(`/demo/success?demoId=${encodeURIComponent(data.demoId)}`);
    } catch {
      setError("Demo start nije uspio. Provjerite DEMO_MODE konfiguraciju.");
    }
  };

  return (
    <section aria-labelledby="demo-start-heading" className="mx-auto max-w-xl px-6 py-12">
      <h1 id="demo-start-heading" className="text-3xl font-bold text-text-primary">
        Start Demo
      </h1>
      <input
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        placeholder="Organization name"
        className="mt-4 h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3"
      />
      <button className="mt-3 rounded-md bg-brand px-4 py-2 text-white" onClick={() => void onStart()}>
        Create demo tenant
      </button>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

