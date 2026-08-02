import { type JSX } from "react";
import { Link, useSearchParams } from "react-router";

export default function DemoSuccessPage(): JSX.Element {
  const [sp] = useSearchParams();
  const demoId = sp.get("demoId") ?? "—";
  return (
    <section aria-labelledby="demo-success-heading" className="mx-auto max-w-xl px-6 py-12">
      <h1 id="demo-success-heading" className="text-3xl font-bold text-text-primary">
        Demo ready
      </h1>
      <p className="mt-2 text-text-secondary">Demo ID: {demoId}</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-white">
        Open dashboard
      </Link>
    </section>
  );
}

