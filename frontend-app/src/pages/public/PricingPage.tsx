import { useState, type FormEvent, type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { contactSales } from "@/lib/api-onboarding";

const plans = [
  { name: "Starter", price: "€49/mo", features: ["Core LMS", "Certification workflow"] },
  { name: "Professional", price: "€149/mo", features: ["Committee governance", "Public verification"] },
  { name: "Enterprise", price: "Contact sales", features: ["Multi-tenant ops", "Custom integrations"] },
];

export default function PricingPage(): JSX.Element {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [planInterest, setPlanInterest] = useState("enterprise");
  const [pending, setPending] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (company.trim() && email.trim()) {
      setPending(true);
      void contactSales({ company, email, planInterest, message: "Pricing page contact / invoice request" })
        .then((out) => setLeadId(out.leadId))
        .finally(() => setPending(false));
    }
  };
  return (
    <section aria-labelledby="pricing-heading" className="mx-auto max-w-6xl px-6 py-12">
      <h1 id="pricing-heading" className="text-3xl font-bold text-text-primary">
        Pricing
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Built for organizations running ISO/IEC 17024-aligned certification processes.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <section key={p.name} className="rounded-xl border border-border/50 p-4">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-lg">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-text-secondary">
              {p.features.map((f) => (
                <li key={f}>- {f}</li>
              ))}
            </ul>
            <Link className="mt-4 inline-block rounded-md border border-border/60 px-3 py-2 text-sm" to="/book-demo">
              Request demo
            </Link>
          </section>
        ))}
      </div>
      <form onSubmit={submit} className="mt-8 rounded-xl border border-border/50 p-4">
        <h2 className="font-semibold text-text-primary">Request invoice / contact sales</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
          <select value={planInterest} onChange={(e) => setPlanInterest(e.target.value)} className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm">
            <option value="starter">Entry plan</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <Button className="mt-3" type="submit" disabled={pending || !company.trim() || !email.trim()}>
          Contact sales
        </Button>
        {leadId ? <p className="mt-2 text-sm text-emerald-300">Lead received: {leadId}</p> : null}
      </form>
    </section>
  );
}

