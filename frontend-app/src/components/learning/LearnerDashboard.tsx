import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";
import { DASHBOARD_NS } from "@confora/i18n";
import { useTranslation } from "react-i18next";

import {
  enrolInLearningCourse,
  fetchLearningCatalogue,
  fetchMyLearningEnrolments,
  readLearningCart,
  writeLearningCart,
  type PublishedCourse,
} from "@/lib/learning-api";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const addButtonClass =
  "inline-flex h-11 items-center justify-center rounded-md bg-[#0EA5E9] px-4 text-sm font-semibold text-white hover:bg-[#0284C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]";

function courseImage(course: PublishedCourse): string | null {
  const key = course.imageObjectKey;
  if (!key) return null;
  if (key.startsWith("/") || key.startsWith("http://") || key.startsWith("https://")) return key;
  return null;
}

export function LearnerDashboard({ learnerName }: { readonly learnerName: string }): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  const queryClient = useQueryClient();
  const [area, setArea] = useState<string | null>(null);
  const [selected, setSelected] = useState<PublishedCourse | null>(null);
  const [cart, setCart] = useState<readonly string[]>(() => readLearningCart());

  const catalogue = useQuery({
    queryKey: ["learning", "catalogue", area],
    queryFn: () => fetchLearningCatalogue(area ?? undefined),
  });
  const enrolments = useQuery({
    queryKey: ["learning", "enrolments"],
    queryFn: fetchMyLearningEnrolments,
  });
  const enrol = useMutation({
    mutationFn: enrolInLearningCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "enrolments"] });
    },
  });

  const groups = useMemo(() => {
    const courses = catalogue.data?.courses ?? [];
    const codes = [...new Set(courses.map((course) => course.areaCode))];
    return codes.map((code) => ({
      code,
      courses: courses.filter((course) => course.areaCode === code),
    }));
  }, [catalogue.data]);

  function addToCart(courseId: string): void {
    const next = [...new Set([...cart, courseId])];
    writeLearningCart(next);
    setCart(next);
    setSelected(null);
  }

  async function enrolCart(): Promise<void> {
    for (const courseId of cart) {
      await enrol.mutateAsync(courseId);
    }
    writeLearningCart([]);
    setCart([]);
  }

  const name = learnerName.trim().length > 0 ? learnerName : t("greeting.anonymous");

  return (
    <section aria-labelledby="learning-welcome" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 text-text-primary">
      <header className="space-y-3">
        <h1 id="learning-welcome" className="text-3xl font-semibold">
          {t("learning.welcome", { name })}
        </h1>
        <p className="max-w-3xl text-text-secondary">{t("learning.platformInfo")}</p>
        <p>
          <Link className="text-[#0EA5E9] underline-offset-4 hover:underline" to="/dashboard/learner/statistics">
            {t("learning.statisticsLink")}
          </Link>
        </p>
      </header>

      <section aria-labelledby="learning-messages">
        <h2 id="learning-messages" className="text-lg font-semibold">
          {t("learning.messagesTitle")}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-text-secondary">
          <li>{t("learning.message1")}</li>
          <li>{t("learning.message2")}</li>
          <li>{t("learning.message3")}</li>
        </ul>
      </section>

      <section aria-labelledby="learning-continue">
        <h2 id="learning-continue" className="text-lg font-semibold">
          {t("learning.continueLearning")}
        </h2>
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {(enrolments.data ?? []).map((row) => (
            <li key={row.enrolmentId} className="min-w-64 rounded-xl border border-white/10 bg-surface-secondary p-4">
              <p className="font-medium">{row.courseTitle}</p>
              <p className="text-sm text-text-secondary">
                {row.progressPercent}% · {row.paymentState === "PENDING_PAYMENT" ? t("learning.pendingPayment") : t("learning.paymentNotRequired")}
              </p>
              <Link className="mt-3 inline-flex text-[#0EA5E9] underline-offset-4 hover:underline" to={`/dashboard/learner/courses/${row.enrolmentId}`}>
                {t("learning.openPlayer")}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learning-catalogue">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="learning-catalogue" className="sr-only">
            {t("learning.filterLabel")}
          </h2>
          <p id="area-filter-label" className="text-sm font-medium">
            {t("learning.filterLabel")}
          </p>
          <div role="group" aria-labelledby="area-filter-label" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={area === null}
              className="rounded-full border border-white/15 px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
              onClick={() => setArea(null)}
            >
              {t("learning.filterAll")}
            </button>
            {(catalogue.data?.areas ?? []).map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={area === item.code}
                className="rounded-full border border-white/15 px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                onClick={() => setArea(item.code)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </div>

        {catalogue.isError ? (
          <p role="alert" className="mt-4 text-red-300">
            {t("learning.loadError")}
          </p>
        ) : null}
        {!catalogue.isLoading && groups.length === 0 ? <p className="mt-4">{t("learning.emptyCatalogue")}</p> : null}

        <div className="mt-6 space-y-8">
          {groups.map((group) => (
            <section key={group.code} aria-labelledby={`area-${group.code}`}>
              <h3 id={`area-${group.code}`} className="text-xl font-semibold">
                {group.code}
              </h3>
              <ul className="mt-3 flex gap-4 overflow-x-auto pb-2">
                {group.courses.map((course) => {
                  const image = courseImage(course);
                  return (
                    <li key={course.id} className="w-72 shrink-0 rounded-xl border border-white/10 bg-surface-secondary p-4">
                      {image ? (
                        <img src={image} alt="" className="h-36 w-full rounded-md object-cover" />
                      ) : (
                        <div className="h-36 rounded-md bg-[#0EA5E9]/20" aria-hidden="true" />
                      )}
                      <h4 className="mt-3 font-semibold">{course.title}</h4>
                      <button
                        type="button"
                        className="mt-3 text-sm text-[#0EA5E9] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                        onClick={() => setSelected(course)}
                      >
                        {t("learning.general")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="learning-cart" className="rounded-xl border border-white/10 bg-surface-secondary p-4">
        <h2 id="learning-cart" className="text-lg font-semibold">
          {t("learning.cartTitle")}
        </h2>
        {cart.length === 0 ? <p className="mt-2 text-text-secondary">{t("learning.cartEmpty")}</p> : null}
        <ul className="mt-2 space-y-1">
          {cart.map((courseId) => (
            <li key={courseId}>{catalogue.data?.courses.find((course) => course.id === courseId)?.title ?? courseId}</li>
          ))}
        </ul>
        <p aria-live="polite" className="sr-only">
          {t("learning.cartCount", { count: cart.length })}
        </p>
        <button type="button" className={`${addButtonClass} mt-4`} disabled={cart.length === 0 || enrol.isPending} onClick={() => void enrolCart()}>
          {t("learning.enrolSelected")}
        </button>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-3xl border-white/10 bg-surface-primary text-text-primary">
          {selected ? (
            <>
              <DialogTitle>{selected.title}</DialogTitle>
              <DialogDescription>{selected.description}</DialogDescription>
              {courseImage(selected) ? (
                <img src={courseImage(selected) ?? ""} alt="" className="h-56 w-full rounded-md object-cover" />
              ) : null}
              <button type="button" className={addButtonClass} onClick={() => addToCart(selected.id)}>
                {t("learning.addCourse")}
              </button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
