import { useMutation } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { clearCart } from "@/lib/lms-cart";
import { postStripeConfirm } from "@/lib/lms-learner-api";

export default function CheckoutSuccessPage(): JSX.Element {
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";

  const q = useMutation({
    mutationFn: () => postStripeConfirm(sessionId),
  });

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-text-primary">
      <h1 className="text-xl font-bold">Plaćanje</h1>
      {!sessionId ? (
        <p className="text-sm text-text-secondary">Nedostaje session_id u URL-u.</p>
      ) : (
        <>
          <p className="text-sm text-text-secondary">Potvrđujemo uplatu sa Stripe-a…</p>
          <Button
            type="button"
            onClick={() => {
              q.mutate(undefined, {
                onSuccess: () => {
                  clearCart();
                },
              });
            }}
            disabled={q.isPending || q.isSuccess}
          >
            {q.isSuccess ? "Potvrđeno" : "Potvrdi upis"}
          </Button>
          {q.isError ? (
            <p className="text-sm text-red-400" role="alert">
              Potvrda nije uspjela (provjerite STRIPE_SECRET_KEY i session).
            </p>
          ) : null}
          {q.isSuccess ? (
            <p className="text-sm text-emerald-400">
              Upisi su aktivirani.{" "}
              <Link to="/dashboard/courses" className="underline">
                Moji tečajevi
              </Link>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
