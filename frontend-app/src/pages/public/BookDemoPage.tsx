import { type JSX } from "react";
import { Link } from "react-router";

export default function BookDemoPage(): JSX.Element {
  return (
    <section aria-labelledby="book-demo-heading" className="mx-auto max-w-3xl px-6 py-12">
      <h1 id="book-demo-heading" className="text-3xl font-bold text-text-primary">
        Book a Demo
      </h1>
      <p className="mt-2 text-text-secondary">Talk with CONFORA team and prepare a pilot-ready setup.</p>
      <Link to="/onboarding" className="mt-4 inline-block rounded bg-brand px-4 py-2 text-white">Continue</Link>
    </section>
  );
}

