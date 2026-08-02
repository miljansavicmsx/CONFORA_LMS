import { NOTIFICATION_EVENT_KEYS, type NotificationEventKey } from "@/lib/notification-event-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api-notifications";

export default function DashboardSettingsPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["me", "notification-prefs"] as const,
    queryFn: fetchNotificationPreferences,
  });

  const [locale, setLocale] = useState("en");
  const [channels, setChannels] = useState<
    Record<string, { email?: boolean; inApp?: boolean; sms?: boolean }>
  >({});

  useEffect(() => {
    if (!q.data) return;
    setLocale(q.data.locale ?? "en");
    setChannels((q.data.channels as typeof channels) ?? {});
  }, [q.data]);

  const save = useMutation({
    mutationFn: () => updateNotificationPreferences({ locale, channels }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me", "notification-prefs"] });
    },
  });

  const setChannel = (eventKey: string, key: "email" | "inApp" | "sms", value: boolean) => {
    setChannels((prev) => ({
      ...prev,
      [eventKey]: { ...prev[eventKey], [key]: value },
    }));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Postavke</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Pretplate na obavještenja (email, u aplikaciji, SMS gdje je uključeno). ISO §9.3.5 / §9.6.
        </p>
      </div>

      <section className="rounded-xl border border-border/50 bg-surface-secondary/30 p-6">
        <h2 className="text-sm font-semibold text-text-primary">Jezik obavještenja</h2>
        <select
          className="mt-2 h-10 rounded-md border border-border/60 bg-surface-primary px-3 text-sm"
          onChange={(e) => setLocale(e.target.value)}
          value={locale}
        >
          <option value="en">English</option>
          <option value="hr">Hrvatski (B/H/S)</option>
        </select>
      </section>

      <section className="rounded-xl border border-border/50 bg-surface-secondary/30 p-6">
        <h2 className="text-sm font-semibold text-text-primary">Događaji</h2>
        <p className="mt-1 text-xs text-text-muted">
          Isključite kanal za pojedini tip poruke. Zadano: email i in-app uključeni, SMS isključen.
        </p>
        <ul className="mt-4 max-h-[420px] space-y-3 overflow-auto text-sm">
          {NOTIFICATION_EVENT_KEYS.map((ek: NotificationEventKey) => {
            const c = channels[ek] ?? {};
            return (
              <li className="rounded-lg border border-border/40 p-3" key={ek}>
                <div className="font-mono text-xs text-text-primary">{ek}</div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-secondary">
                  <label className="flex items-center gap-2">
                    <input
                      checked={c.email !== false}
                      onChange={(e) => setChannel(ek, "email", e.target.checked)}
                      type="checkbox"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={c.inApp !== false}
                      onChange={(e) => setChannel(ek, "inApp", e.target.checked)}
                      type="checkbox"
                    />
                    U aplikaciji
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={c.sms === true}
                      onChange={(e) => setChannel(ek, "sms", e.target.checked)}
                      type="checkbox"
                    />
                    SMS
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <Button className="mt-4" disabled={save.isPending} onClick={() => save.mutate()} type="button">
          {save.isPending ? "Spremanje…" : "Spremi postavke"}
        </Button>
      </section>
    </div>
  );
}
