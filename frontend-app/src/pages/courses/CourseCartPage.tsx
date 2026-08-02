import { useMutation } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { clearCart, getCartCourseIds, removeFromCart } from "@/lib/lms-cart";
import { postStripeCheckout } from "@/lib/lms-learner-api";
import { useAuthStore } from "@/stores/authStore";

export default function CourseCartPage(): JSX.Element {
  const token = useAuthStore((s) => s.accessToken);
  const ids = getCartCourseIds();

  const checkout = useMutation({
    mutationFn: async () => {
      const { url } = await postStripeCheckout(ids);
      window.location.href = url;
    },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10 text-text-primary">
      <h1 className="text-xl font-bold">Košarica</h1>
      {!token ? (
        <p className="text-sm text-text-secondary">
          <Link to="/login" className="text-brand underline">
            Prijavite se
          </Link>{" "}
          za naplatu.
        </p>
      ) : null}
      <ul className="space-y-2">
        {ids.map((id) => (
          <li key={id} className="flex items-center justify-between rounded border border-border/50 px-3 py-2 text-sm">
            <span className="font-mono text-xs text-text-muted">{id}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeFromCart(id)}>
              Ukloni
            </Button>
          </li>
        ))}
      </ul>
      {ids.length === 0 ? <p className="text-sm text-text-muted">Košarica je prazna.</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => clearCart()} disabled={ids.length === 0}>
          Isprazni
        </Button>
        <Button
          type="button"
          disabled={!token || ids.length === 0 || checkout.isPending}
          onClick={() => checkout.mutate()}
        >
          Naplata (Stripe)
        </Button>
      </div>
    </div>
  );
}
