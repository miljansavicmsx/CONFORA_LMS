import { type JSX } from "react";

export default function SimpleContentPage({ title, text }: { title: string; text: string }): JSX.Element {
  return (
    <section aria-labelledby="simple-page-heading" className="mx-auto max-w-5xl px-6 py-12">
      <h1 id="simple-page-heading" className="text-3xl font-bold text-text-primary">
        {title}
      </h1>
      <p className="mt-3 text-text-secondary">{text}</p>
    </section>
  );
}

