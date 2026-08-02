import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/api-feedback";

export function FeedbackWidget(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [severity, setSeverity] = useState("low");
  const [priority, setPriority] = useState("normal");

  const mutation = useMutation({
    mutationFn: () =>
      submitFeedback({
        category,
        severity,
        priority,
        message: message.trim(),
        page: window.location.pathname,
        ...(title.trim() ? { title: title.trim() } : {}),
      }),
    onSuccess: () => {
      setTitle("");
      setMessage("");
      setOpen(false);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 2) {
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <form onSubmit={onSubmit} className="w-80 rounded-xl border border-border/60 bg-surface-secondary p-3 shadow-xl">
          <p className="text-sm font-semibold text-text-primary">Pošalji povratnu informaciju</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs"
            placeholder="Naslov (opcionalno)"
            maxLength={200}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs">
              <option value="general">general</option>
              <option value="bug">bug</option>
              <option value="ux">ux</option>
              <option value="pilot">pilot</option>
            </select>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-2 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs"
            aria-label="Prioritet"
          >
            <option value="low">prioritet: nizak</option>
            <option value="normal">prioritet: normalan</option>
            <option value="high">prioritet: visok</option>
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 min-h-24 w-full rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
            placeholder="Poruka (obavezno)"
          />
          {mutation.isSuccess ? (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400" role="status">
              Hvala — ticket je zaprimljen.
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending || message.trim().length < 2}>
              Pošalji
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          onClick={() => {
            mutation.reset();
            setOpen(true);
          }}
        >
          Povratna informacija
        </Button>
      )}
    </div>
  );
}
