import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ImagePlus, Loader2, Minus, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { Link, useNavigate } from "react-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TRAINING_DOMAINS } from "@/admin/constants/training-domains";
import {
  type Step1BasicInfoFormValues,
  step1BasicInfoSchema,
  step1DefaultValues,
} from "@/admin/schemas/step1BasicInfoSchema";
import { useWizardStore } from "@/admin/store/wizardStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { createAdminCourse } from "@/lib/admin-course-create-api";
import { cn } from "@/lib/utils";

const URL_PREVIEW_BASE = "https://confora.io/obuke/";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function plainLen(html: string): number {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").trim().length;
}

function readImageFile16x9(file: File): Promise<{ dataUrl: string } | { error: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ error: "Odaberite sliku (PNG, JPG, WebP)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const target = 16 / 9;
        if (Math.abs(ratio - target) > 0.07) {
          resolve({ error: `Omjer mora biti 16:9 (trenutno ≈ ${ratio.toFixed(2)}:1).` });
          return;
        }
        resolve({ dataUrl: reader.result as string });
      };
      img.onerror = () => resolve({ error: "Učitavanje slike nije uspjelo." });
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve({ error: "Čitanje fajla nije uspjelo." });
    reader.readAsDataURL(file);
  });
}

function readImageFileAny(file: File): Promise<{ dataUrl: string } | { error: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ error: "Odaberite sliku." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result as string });
    reader.onerror = () => resolve({ error: "Čitanje fajla nije uspjelo." });
    reader.readAsDataURL(file);
  });
}

function minutesToTimeString(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function timeStringToMinutes(t: string): number {
  const parts = t.split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  const hh = Number.isFinite(h) ? h : 0;
  const mm = Number.isFinite(m) ? m : 0;
  return hh * 60 + mm;
}

const COOLDOWN_LABELS: Record<Step1BasicInfoFormValues["examCooldown"], string> = {
  immediate: "Odmah",
  "12h": "12 sati",
  "24h": "24 sata",
  "48h": "48 sati",
  "7d": "7 dana",
};

const ATTEMPT_SEGMENTS: Array<{ v: Step1BasicInfoFormValues["examAttempts"]; label: string }> = [
  { v: 1, label: "1" },
  { v: 2, label: "2" },
  { v: 3, label: "3" },
  { v: 5, label: "5" },
  { v: "unlimited", label: "∞" },
];

function DescriptionEditor({
  value,
  onChange,
  error,
}: {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly error?: string;
}): JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: "Detaljan opis obuke, preduvjeti, publika…" }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[140px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/40",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const cur = editor.getHTML();
    if (value && value !== cur) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const count = plainLen(value);

  return (
    <div className="space-y-1">
      <EditorContent editor={editor} />
      <div className="flex justify-between text-xs text-slate-500">
        <span className={cn(plainLen(value) < 100 && "text-amber-600")}>
          {plainLen(value)} / min. 100 znakova (čist tekst)
        </span>
        <span>{count} znakova (čist tekst)</span>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ExamPreviewPanel({ values }: { readonly values: Step1BasicInfoFormValues }): JSX.Element {
  const y = values.examQuestionCount;
  const pct = values.passingScorePct;
  const need = Math.max(1, Math.ceil((y * pct) / 100));
  const attemptsLabel =
    values.examAttempts === "unlimited" ? "Neograničeno" : String(values.examAttempts);
  const limitLabel = values.examNoTimeLimit
    ? "Bez vremenskog limita"
    : `${values.examTimeLimitMinutes ?? 0} min`;
  const cooldown = COOLDOWN_LABELS[values.examCooldown];
  const order = values.examRandomOrder ? "Nasumičan" : "Fiksan";
  const results = values.examShowResults ? "Da" : "Ne";
  const cert =
    values.certLifetime || !values.certValidityMonths
      ? "Doživotno"
      : `${values.certValidityMonths} mj.`;

  if (values.certificationType === "none") {
    return (
      <Card className="sticky top-6 border-slate-200 bg-slate-50/80">
        <CardHeader>
          <CardTitle className="text-base">Pregled ispita</CardTitle>
          <CardDescription>Odaberite certifikaciju da vidite uvjete ispita.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6 border-[#1F4E79]/25 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-[#1F4E79]">Kako polaznik vidi ispit</CardTitle>
        <CardDescription>Sažetak pravila prije objave</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 space-y-2">
          <p>
            <span className="font-medium text-slate-800">Broj pitanja:</span> {y}
          </p>
          <p>
            <span className="font-medium text-slate-800">Prolaznost:</span> {pct}% — tačno{" "}
            <strong>{need}</strong> od <strong>{y}</strong> pitanja
          </p>
          <p>
            <span className="font-medium text-slate-800">Pokušaji:</span> {attemptsLabel}
          </p>
          <p>
            <span className="font-medium text-slate-800">Vrijeme:</span> {limitLabel}
          </p>
          <p>
            <span className="font-medium text-slate-800">Karenca:</span> {cooldown}
          </p>
          <p>
            <span className="font-medium text-slate-800">Redoslijed:</span> {order}
          </p>
          <p>
            <span className="font-medium text-slate-800">Prikaz rezultata:</span> {results}
          </p>
          <p>
            <span className="font-medium text-slate-800">Certifikat važi:</span> {cert}
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Tip certifikacije:{" "}
          {values.certificationType === "confora" ? "CONFORA" : "Eksterni certifikator"}
        </p>
      </CardContent>
    </Card>
  );
}

export function Step1BasicInfo(): JSX.Element {
  const navigate = useNavigate();
  const setStep1Full = useWizardStore((s) => s.setStep1Full);
  const resetWizard = useWizardStore((s) => s.resetWizard);

  const [hydrated, setHydrated] = useState(() => useWizardStore.persist.hasHydrated());
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const slugManualRef = useRef(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<Step1BasicInfoFormValues>({
    resolver: zodResolver(step1BasicInfoSchema),
    defaultValues: step1DefaultValues,
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const learningGoals = watch("learningGoals");

  const updateLearningGoal = (index: number, value: string): void => {
    const next = [...learningGoals];
    next[index] = value;
    setValue("learningGoals", next, { shouldValidate: true, shouldDirty: true });
  };

  const addLearningGoal = (): void => {
    if (learningGoals.length >= 10) {
      return;
    }
    setValue("learningGoals", [...learningGoals, ""], { shouldValidate: true, shouldDirty: true });
  };

  const removeLearningGoal = (index: number): void => {
    if (learningGoals.length <= 3) {
      return;
    }
    setValue(
      "learningGoals",
      learningGoals.filter((_, j) => j !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  useEffect(() => {
    if (useWizardStore.persist.hasHydrated()) {
      form.reset(useWizardStore.getState().step1);
      setHydrated(true);
      return;
    }
    const done = useWizardStore.persist.onFinishHydration(() => {
      form.reset(useWizardStore.getState().step1);
      setHydrated(true);
    });
    return done;
  }, [form]);

  const watched = useWatch({ control });
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(() => {
      setStep1Full(form.getValues());
    }, 400);
    return () => {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current);
      }
    };
  }, [watched, hydrated, form, setStep1Full]);

  const nameVal = watch("name");
  const slugVal = watch("slug");
  const certificationType = watch("certificationType");
  const passingScorePct = watch("passingScorePct");
  const examQuestionCount = watch("examQuestionCount");
  const examNoTimeLimit = watch("examNoTimeLimit");
  const examTimeLimitMinutes = watch("examTimeLimitMinutes");
  const accessType = watch("accessType");
  const certLifetime = watch("certLifetime");

  useEffect(() => {
    if (slugManualRef.current) {
      return;
    }
    const s = slugify(nameVal);
    if (s) {
      setValue("slug", s, { shouldValidate: true, shouldDirty: true });
    }
  }, [nameVal, setValue]);

  const passingTone = useMemo(() => {
    if (passingScorePct < 50) {
      return "danger" as const;
    }
    if (passingScorePct < 70) {
      return "warn" as const;
    }
    return "ok" as const;
  }, [passingScorePct]);

  const [timeStr, setTimeStr] = useState(() => minutesToTimeString(examTimeLimitMinutes ?? 60));
  useEffect(() => {
    if (!examNoTimeLimit && examTimeLimitMinutes != null) {
      setTimeStr(minutesToTimeString(examTimeLimitMinutes));
    }
  }, [examNoTimeLimit, examTimeLimitMinutes]);

  const onDropThumbnail = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (!f) {
        return;
      }
      const r = await readImageFile16x9(f);
      if ("error" in r) {
        form.setError("thumbnailDataUrl", { message: r.error });
        return;
      }
      form.clearErrors("thumbnailDataUrl");
      setValue("thumbnailDataUrl", r.dataUrl, { shouldValidate: true });
    },
    [form, setValue],
  );

  const onDropHero = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (!f) {
        return;
      }
      const r = await readImageFileAny(f);
      if ("error" in r) {
        form.setError("heroBannerDataUrl", { message: r.error });
        return;
      }
      form.clearErrors("heroBannerDataUrl");
      setValue("heroBannerDataUrl", r.dataUrl, { shouldValidate: true });
    },
    [form, setValue],
  );

  const showExamSection = certificationType === "confora" || certificationType === "external";

  const onCreateAndOpenEditor = handleSubmit(async (formValues) => {
    setPublishError(null);
    setPublishing(true);
    try {
      setStep1Full(formValues);
      const { courseId } = await createAdminCourse(formValues);
      resetWizard();
      navigate(`/dashboard/admin/sadrzaj?courseId=${encodeURIComponent(courseId)}`, { replace: true });
    } catch (e: unknown) {
      const detail =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      let msg = "";
      if (typeof detail === "string") {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail
          .map((x) => {
            if (typeof x === "object" && x !== null && "msg" in x) {
              return String((x as { msg: string }).msg);
            }
            return "";
          })
          .filter(Boolean)
          .join("; ");
      }
      setPublishError(msg || "Kreiranje kursa nije uspjelo. Provjeri API, ulogu (admin/instructor) i jedinstvenost sluga.");
    } finally {
      setPublishing(false);
    }
  });

  if (!hydrated) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Učitavanje sačuvanog koraka…
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-6xl space-y-10 pb-16"
      onSubmit={handleSubmit((formValues) => {
        setStep1Full(formValues);
      })}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {/* 1A */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1F4E79]">1A — Identifikacija</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="course-name">Naziv obuke</Label>
                <span className="text-xs text-slate-500">{nameVal.length} / 120</span>
              </div>
              <Input
                id="course-name"
                maxLength={120}
                {...register("name")}
                placeholder="Npr. ISO 27001 Lead Implementer"
              />
              {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input
                id="course-slug"
                value={slugVal}
                onChange={(e) => {
                  slugManualRef.current = true;
                  setValue("slug", e.target.value, { shouldValidate: true, shouldDirty: true });
                }}
                className="font-mono text-sm"
              />
              {errors.slug ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
              <p className="text-xs text-slate-500 break-all">
                URL: {URL_PREVIEW_BASE}
                <span className="font-medium text-[#1F4E79]">{slugVal || "vas-slug"}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Oblast</Label>
              <Controller
                name="domains"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between font-normal">
                        {field.value.length ? `${field.value.length} odabrano` : "Odaberite oblasti"}
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-72 overflow-y-auto p-2" align="start">
                      <div className="space-y-2">
                        {TRAINING_DOMAINS.map((d) => {
                          const checked = field.value.includes(d);
                          return (
                            <label key={d} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  if (v === true) {
                                    field.onChange([...field.value, d]);
                                  } else {
                                    field.onChange(field.value.filter((x) => x !== d));
                                  }
                                }}
                              />
                              <span className="text-sm">{d}</span>
                            </label>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.domains ? <p className="text-sm text-red-600">{errors.domains.message}</p> : null}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="subtitle">Podnaslov</Label>
                <span className="text-xs text-slate-500">{(watch("subtitle") || "").length} / 200</span>
              </div>
              <Input id="subtitle" maxLength={200} {...register("subtitle")} />
              {errors.subtitle ? <p className="text-sm text-red-600">{errors.subtitle.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <DescriptionEditor
                    value={field.value}
                    onChange={field.onChange}
                    {...(fieldState.error?.message ? { error: fieldState.error.message } : {})}
                  />
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ciljevi učenja ({learningGoals.length} / 10)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={learningGoals.length >= 10}
                  onClick={addLearningGoal}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Dodaj cilj
                </Button>
              </div>
              <div className="space-y-2">
                {learningGoals.map((goal, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateLearningGoal(i, e.target.value)}
                      placeholder={`Cilj ${i + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={learningGoals.length <= 3}
                      onClick={() => removeLearningGoal(i)}
                      aria-label="Ukloni cilj"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.learningGoals ? (
                <p className="text-sm text-red-600">{errors.learningGoals.message as string}</p>
              ) : null}
            </div>
          </section>

          <Separator />

          {/* 1B */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1F4E79]">1B — Vizualni identitet</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Thumbnail 16:9</Label>
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropThumbnail}
                  className={cn(
                    "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600 transition hover:border-[#1F4E79]/50",
                  )}
                  onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLDivElement).click()}
                  onClick={() => document.getElementById("thumb-input")?.click()}
                >
                  <ImagePlus className="mb-2 h-8 w-8 text-slate-400" />
                  Prevuci i ispusti ili klikni — samo 16:9
                  <input
                    id="thumb-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        return;
                      }
                      const r = await readImageFile16x9(f);
                      if ("error" in r) {
                        form.setError("thumbnailDataUrl", { message: r.error });
                      } else {
                        form.clearErrors("thumbnailDataUrl");
                        setValue("thumbnailDataUrl", r.dataUrl, { shouldValidate: true });
                      }
                    }}
                  />
                </div>
                {watch("thumbnailDataUrl") ? (
                  <img
                    src={watch("thumbnailDataUrl")}
                    alt="Pregled thumb"
                    className="mt-2 max-h-40 rounded-md border object-cover"
                  />
                ) : null}
                {errors.thumbnailDataUrl ? (
                  <p className="text-sm text-red-600">{errors.thumbnailDataUrl.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Hero baner (opciono)</Label>
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropHero}
                  className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500"
                  onClick={() => document.getElementById("hero-input")?.click()}
                >
                  <ImagePlus className="mb-2 h-8 w-8 text-slate-400" />
                  Opciono — prevuci ili klikni
                  <input
                    id="hero-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        return;
                      }
                      const r = await readImageFileAny(f);
                      if ("error" in r) {
                        form.setError("heroBannerDataUrl", { message: r.error });
                      } else {
                        form.clearErrors("heroBannerDataUrl");
                        setValue("heroBannerDataUrl", r.dataUrl, { shouldValidate: true });
                      }
                    }}
                  />
                </div>
                {watch("heroBannerDataUrl") ? (
                  <img
                    src={watch("heroBannerDataUrl")}
                    alt="Hero"
                    className="mt-2 max-h-32 w-full rounded-md border object-cover"
                  />
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-video">Promo video URL (YouTube / Vimeo)</Label>
              <Input id="promo-video" {...register("promoVideoUrl")} placeholder="https://www.youtube.com/watch?v=…" />
              {errors.promoVideoUrl ? <p className="text-sm text-red-600">{errors.promoVideoUrl.message}</p> : null}
            </div>
          </section>

          <Separator />

          {/* 1C */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1F4E79]">1C — Komercijalni podaci</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Cijena</Label>
                <Input id="price" type="number" step="0.01" min={0} {...register("price")} />
                {errors.price ? <p className="text-sm text-red-600">{errors.price.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  {...register("currency")}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="BAM">BAM</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-level">Razina težine</Label>
                <select
                  id="course-level"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  {...register("level")}
                >
                  <option value="Pocetni">Početni</option>
                  <option value="Srednji">Srednji</option>
                  <option value="Napredni">Napredni</option>
                </select>
                {errors.level ? <p className="text-sm text-red-600">{errors.level.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-hours">Trajanje kursa (sati)</Label>
                <Input
                  id="duration-hours"
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  {...register("durationHours")}
                />
                {errors.durationHours ? (
                  <p className="text-sm text-red-600">{errors.durationHours.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Tip pristupa</Label>
              <div className="flex flex-wrap gap-4">
                {(
                  [
                    { v: "lifetime" as const, l: "Doživotni" },
                    { v: "yearly" as const, l: "Godišnji" },
                    { v: "custom" as const, l: "Prilagođeni" },
                  ] as const
                ).map(({ v, l }) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" value={v} {...register("accessType")} className="accent-[#1F4E79]" />
                    {l}
                  </label>
                ))}
              </div>
              {accessType === "custom" ? (
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="custom-months">Trajanje pristupa (mjeseci)</Label>
                  <Input id="custom-months" type="number" min={1} max={120} {...register("customAccessMonths")} />
                  {errors.customAccessMonths ? (
                    <p className="text-sm text-red-600">{errors.customAccessMonths.message}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <Separator />

          {/* 1D + 1F */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1F4E79]">1D — Certifikacija</h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  { v: "none" as const, l: "Bez certifikacije" },
                  { v: "confora" as const, l: "Sa CONFORA certifikacijom" },
                  { v: "external" as const, l: "Eksterni certifikator" },
                ] as const
              ).map(({ v, l }) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <input type="radio" value={v} {...register("certificationType")} className="accent-[#1F4E79]" />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {showExamSection ? (
                <motion.div
                  key="exam-block"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 pt-2 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800">1F — Ispitna konfiguracija</h3>

                    <div className="flex flex-wrap items-center gap-3">
                      <Label className="shrink-0">Broj pitanja</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => {
                            const n = Number(examQuestionCount) || 1;
                            setValue("examQuestionCount", Math.max(1, n - 1), { shouldValidate: true });
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={500}
                          className="w-20 text-center"
                          {...register("examQuestionCount")}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => {
                            const n = Number(examQuestionCount) || 1;
                            setValue("examQuestionCount", Math.min(500, n + 1), { shouldValidate: true });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label>Prolaznost (%)</Label>
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            passingTone === "danger" && "text-red-600",
                            passingTone === "warn" && "text-amber-600",
                            passingTone === "ok" && "text-emerald-700",
                          )}
                        >
                          {passingScorePct}%
                        </span>
                      </div>
                      <Slider
                        value={[passingScorePct]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(v) => {
                          const n = v[0] ?? 70;
                          setValue("passingScorePct", n, { shouldValidate: true });
                        }}
                        className="py-2"
                      />
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={passingScorePct}
                          onChange={(e) => {
                            const n = Math.min(100, Math.max(1, Number(e.target.value) || 1));
                            setValue("passingScorePct", n, { shouldValidate: true });
                          }}
                        />
                      </div>
                      {passingTone === "danger" ? (
                        <p className="text-sm font-medium text-red-600">
                          Ispod 50% nije dozvoljeno za certificiranu obuku.
                        </p>
                      ) : null}
                      {passingTone === "warn" ? (
                        <p className="text-sm text-amber-700">Upozorenje: prolaznost između 50% i 70% — provjerite kriterije.</p>
                      ) : null}
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-md px-3 py-2 border border-slate-100">
                        Korisnik mora tačno odgovoriti na{" "}
                        <strong>{Math.max(1, Math.ceil((examQuestionCount * passingScorePct) / 100))}</strong> od{" "}
                        <strong>{examQuestionCount}</strong> pitanja.
                      </p>
                      {errors.passingScorePct ? (
                        <p className="text-sm text-red-600">{errors.passingScorePct.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label>Broj pokušaja</Label>
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                        {ATTEMPT_SEGMENTS.map(({ v, label }) => (
                          <Button
                            key={label}
                            type="button"
                            variant={watch("examAttempts") === v ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "rounded-md px-3",
                              watch("examAttempts") === v && "bg-[#1F4E79] hover:bg-[#1F4E79]/90",
                            )}
                            onClick={() => setValue("examAttempts", v, { shouldValidate: true })}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="exam-time">Vremenski limit (sata : minuta)</Label>
                        <Input
                          id="exam-time"
                          type="time"
                          disabled={examNoTimeLimit}
                          value={timeStr}
                          onChange={(e) => {
                            const t = e.target.value;
                            setTimeStr(t);
                            setValue("examTimeLimitMinutes", timeStringToMinutes(t), { shouldValidate: true });
                          }}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={examNoTimeLimit}
                            onCheckedChange={(c) => {
                              const on = c === true;
                              setValue("examNoTimeLimit", on, { shouldValidate: true });
                              if (!on) {
                                setValue("examTimeLimitMinutes", timeStringToMinutes(timeStr), { shouldValidate: true });
                              }
                            }}
                          />
                          Bez limita
                        </label>
                        {errors.examTimeLimitMinutes ? (
                          <p className="text-sm text-red-600">{errors.examTimeLimitMinutes.message}</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cooldown">Karenca između pokušaja</Label>
                        <select
                          id="cooldown"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                          {...register("examCooldown")}
                        >
                          {(Object.keys(COOLDOWN_LABELS) as Step1BasicInfoFormValues["examCooldown"][]).map((k) => (
                            <option key={k} value={k}>
                              {COOLDOWN_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-8">
                      <div className="space-y-2">
                        <Label>Redoslijed pitanja</Label>
                        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 w-fit">
                          <Button
                            type="button"
                            size="sm"
                            variant={watch("examRandomOrder") ? "default" : "ghost"}
                            className={cn(watch("examRandomOrder") && "bg-[#1F4E79] hover:bg-[#1F4E79]/90")}
                            onClick={() => setValue("examRandomOrder", true, { shouldValidate: true })}
                          >
                            Nasumičan
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={!watch("examRandomOrder") ? "default" : "ghost"}
                            className={cn(!watch("examRandomOrder") && "bg-[#1F4E79] hover:bg-[#1F4E79]/90")}
                            onClick={() => setValue("examRandomOrder", false, { shouldValidate: true })}
                          >
                            Fiksan
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Prikaz rezultata</Label>
                        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 w-fit">
                          <Button
                            type="button"
                            size="sm"
                            variant={watch("examShowResults") ? "default" : "ghost"}
                            className={cn(watch("examShowResults") && "bg-[#1F4E79] hover:bg-[#1F4E79]/90")}
                            onClick={() => setValue("examShowResults", true, { shouldValidate: true })}
                          >
                            DA
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={!watch("examShowResults") ? "default" : "ghost"}
                            className={cn(!watch("examShowResults") && "bg-[#1F4E79] hover:bg-[#1F4E79]/90")}
                            onClick={() => setValue("examShowResults", false, { shouldValidate: true })}
                          >
                            NE
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Certifikat važi</Label>
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min={1}
                            max={120}
                            disabled={certLifetime}
                            className="w-28"
                            {...register("certValidityMonths")}
                          />
                          <span className="text-xs text-slate-500">mjeseci</span>
                        </div>
                        <label className="flex items-center gap-2 text-sm pb-2">
                          <input
                            type="radio"
                            name="cert-life"
                            checked={certLifetime}
                            onChange={() => {
                              setValue("certLifetime", true, { shouldValidate: true });
                            }}
                            className="accent-[#1F4E79]"
                          />
                          Doživotno
                        </label>
                        <label className="flex items-center gap-2 text-sm pb-2">
                          <input
                            type="radio"
                            name="cert-life"
                            checked={!certLifetime}
                            onChange={() => setValue("certLifetime", false, { shouldValidate: true })}
                            className="accent-[#1F4E79]"
                          />
                          Ograničeno (gore)
                        </label>
                      </div>
                      {errors.certValidityMonths ? (
                        <p className="text-sm text-red-600">{errors.certValidityMonths.message}</p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          {publishError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {publishError}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90"
              disabled={publishing}
              onClick={() => void onCreateAndOpenEditor()}
            >
              {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              Kreiraj obuku i uredi sadržaj
            </Button>
            <Button type="submit" variant="outline" className="border-slate-300" disabled={publishing}>
              Sačuvaj korak (samo u pregledniku)
            </Button>
            {publishing ? (
              <span className="px-2 py-2 text-sm text-slate-400">Kreiranje…</span>
            ) : (
              <Button variant="ghost" className="text-slate-600" asChild>
                <Link to="/dashboard/admin/sadrzaj">Otvori editor bez novog kursa</Link>
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            „Kreiraj obuku” šalje podatke na backend (DynamoDB + opcionalno S3 za thumbnail ako su postavljeni{" "}
            <span className="font-mono">S3_BUCKET_UPLOADS</span> i javni URL) i otvara uređivač s{" "}
            <span className="font-mono">courseId</span>.
          </p>
        </div>

        <aside className="lg:block">
          <ExamPreviewPanel values={watch()} />
        </aside>
      </div>
    </form>
  );
}
