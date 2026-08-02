/**
 * Dijalog za kreiranje / uređivanje pitanja u item banku.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ItemBankQuestion,
  type ItemBankQuestionType,
  type QuestionDifficulty,
  createQuestion,
  updateQuestion,
} from "@/lib/api-exams";
import { cn } from "@/lib/utils";

const OPTION_SLOTS = 4 as const;

const formSchema = z
  .object({
    questionText: z.string().min(1, "Tekst pitanja je obavezan."),
    scenarioText: z.string().optional(),
    scenarioGroupId: z.string().optional(),
    questionType: z.enum(["MCQ_SINGLE", "TRUE_FALSE"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    timeLimitSeconds: z.coerce.number().int().min(1).max(86_400),
    options: z.array(z.string()).length(OPTION_SLOTS),
    correctOptionIndex: z.coerce.number().int().min(0).max(OPTION_SLOTS - 1),
    isAIGenerated: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const opts = data.options.map((s) => s.trim());
    if (data.questionType === "TRUE_FALSE") {
      if (!opts[0] || !opts[1]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tačno/Netačno zahtijeva popunjene prve dvije opcije.",
          path: ["options"],
        });
      }
    } else {
      if (opts.some((o) => !o)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sve četiri opcije moraju biti popunjene.",
          path: ["options"],
        });
      }
    }
  });

export type QuestionFormValues = z.infer<typeof formSchema>;

export type QuestionDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly courseId: string;
  readonly mode: "create" | "edit";
  readonly initialQuestion: ItemBankQuestion | null;
  readonly onSuccess: () => void | Promise<void>;
};

function optionsFromQuestion(q: ItemBankQuestion | null): [string, string, string, string] {
  if (!q) {
    return ["", "", "", ""];
  }
  const o = [...q.options];
  while (o.length < OPTION_SLOTS) {
    o.push("");
  }
  return o.slice(0, OPTION_SLOTS) as [string, string, string, string];
}

export function QuestionDialog({
  open,
  onOpenChange,
  courseId,
  mode,
  initialQuestion,
  onSuccess,
}: QuestionDialogProps): JSX.Element {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      scenarioText: "",
      scenarioGroupId: "",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      timeLimitSeconds: 90,
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      isAIGenerated: false,
    },
  });

  const {
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === "edit" && initialQuestion) {
      const opts = optionsFromQuestion(initialQuestion);
      const idx = Math.min(
        Math.max(0, initialQuestion.correctOptionIndex),
        OPTION_SLOTS - 1,
      );
      reset({
        questionText: initialQuestion.questionText,
        scenarioText: initialQuestion.scenarioText ?? "",
        scenarioGroupId: initialQuestion.scenarioGroupId ?? "",
        questionType:
          initialQuestion.questionType === "TRUE_FALSE" ? "TRUE_FALSE" : "MCQ_SINGLE",
        difficulty: initialQuestion.difficulty,
        timeLimitSeconds: initialQuestion.timeLimitSeconds,
        options: opts,
        correctOptionIndex: idx,
        isAIGenerated: initialQuestion.isAIGenerated,
      });
    } else {
      reset({
        questionText: "",
        scenarioText: "",
        scenarioGroupId: "",
        questionType: "MCQ_SINGLE",
        difficulty: "MEDIUM",
        timeLimitSeconds: 90,
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        isAIGenerated: false,
      });
    }
  }, [open, mode, initialQuestion, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const scenarioTrim = values.scenarioText?.trim();
    const sg = values.scenarioGroupId?.trim();
    const qType = values.questionType as ItemBankQuestionType;
    const rawOpts = values.options.map((s) => s.trim());
    const optionsPayload =
      qType === "TRUE_FALSE" ? rawOpts.slice(0, 2) : rawOpts;
    try {
      if (mode === "create") {
        await createQuestion({
          courseId,
          questionText: values.questionText.trim(),
          scenarioText: scenarioTrim ? scenarioTrim : null,
          scenarioGroupId: sg ? sg : null,
          questionType: qType,
          options: optionsPayload,
          correctOptionIndex: Math.min(values.correctOptionIndex, optionsPayload.length - 1),
          timeLimitSeconds: values.timeLimitSeconds,
          difficulty: values.difficulty as QuestionDifficulty,
          isAIGenerated: Boolean(values.isAIGenerated),
        });
      } else if (initialQuestion) {
        await updateQuestion(initialQuestion.questionId, {
          courseId,
          questionText: values.questionText.trim(),
          scenarioText: scenarioTrim ? scenarioTrim : null,
          scenarioGroupId: sg ? sg : null,
          questionType: qType,
          options: optionsPayload,
          correctOptionIndex: Math.min(values.correctOptionIndex, optionsPayload.length - 1),
          timeLimitSeconds: values.timeLimitSeconds,
          difficulty: values.difficulty as QuestionDifficulty,
          isAIGenerated: Boolean(values.isAIGenerated),
        });
      }
      await onSuccess();
      onOpenChange(false);
    } catch (e: unknown) {
      let msg = "Spremanje nije uspjelo.";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as { detail?: unknown } | undefined;
        if (typeof d?.detail === "string") {
          msg = d.detail;
        }
      }
      setSubmitError(msg);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] max-w-2xl overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:rounded-xl",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            {mode === "create" ? "Novo pitanje" : "Uredi pitanje"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Kurs: <span className="font-mono text-text-primary">{courseId}</span>. Popuni polja i označi tačan
            odgovor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 py-2">
          {mode === "edit" &&
          (initialQuestion?.status === "DRAFT_AI" || initialQuestion?.status === "AI_SUGGESTED") ? (
            <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Status <span className="font-semibold">AI predložak</span>: ne ulazi u ispit dok tehničko povjerenstvo ne
              odobri, a zatim urednik ne objavi stavku.
            </p>
          ) : null}
          {submitError ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {submitError}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="q-text" className="text-text-secondary">
              Tekst pitanja
            </Label>
            <textarea
              id="q-text"
              rows={4}
              className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              {...register("questionText")}
            />
            {errors.questionText ? (
              <p className="text-xs text-red-400">{errors.questionText.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-scenario" className="text-text-secondary">
              Scenarij (opcionalno)
            </Label>
            <textarea
              id="q-scenario"
              rows={3}
              className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              placeholder="Kontekst za auditora…"
              {...register("scenarioText")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="q-sg" className="text-text-secondary">
                Grupa scenarija (ID)
              </Label>
              <Input
                id="q-sg"
                placeholder="npr. CASE_INCIDENT_01"
                className="border-border/60 bg-surface-primary font-mono text-sm text-text-primary"
                {...register("scenarioGroupId")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">Tip pitanja</Label>
              <select
                className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                {...register("questionType")}
              >
                <option value="MCQ_SINGLE">Više izbora — jedan točan</option>
                <option value="TRUE_FALSE">Tačno / netačno (2 opcije)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-text-secondary">Težina</Label>
              <select
                className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                {...register("difficulty")}
              >
                <option value="EASY">EASY — lako</option>
                <option value="MEDIUM">MEDIUM — srednje</option>
                <option value="HARD">HARD — teško</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-time" className="text-text-secondary">
                Vremensko ograničenje (s)
              </Label>
              <Input
                id="q-time"
                type="number"
                min={1}
                max={86_400}
                className="border-border/60 bg-surface-primary text-text-primary"
                {...register("timeLimitSeconds")}
              />
              {errors.timeLimitSeconds ? (
                <p className="text-xs text-red-400">{errors.timeLimitSeconds.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-surface-primary/50 px-3 py-2">
            <input
              id="q-ai"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
              {...register("isAIGenerated")}
            />
            <Label htmlFor="q-ai" className="cursor-pointer text-sm text-text-secondary">
              Kreirano AI (oznaka za sadržaj generisan pomoću AI)
            </Label>
          </div>

          <div className="space-y-3">
            <Label className="text-text-secondary">Odgovori (točno 4 opcije) — označi tačan</Label>
            {errors.options && !Array.isArray(errors.options) ? (
              <p className="text-xs text-red-400">
                {typeof errors.options.message === "string"
                  ? errors.options.message
                  : "Provjeri opcije."}
              </p>
            ) : null}
            {Array.from({ length: OPTION_SLOTS }, (_, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-text-muted">
                  <input
                    type="radio"
                    value={String(i)}
                    className="h-4 w-4 border-border text-brand focus:ring-brand"
                    {...register("correctOptionIndex", { valueAsNumber: true })}
                  />
                  <span className="w-6 font-mono text-xs">{i + 1}.</span>
                </label>
                <Input
                  className="flex-1 border-border/60 bg-surface-primary text-text-primary"
                  placeholder={`Opcija ${i + 1}`}
                  {...register(`options.${i}` as const)}
                />
                {errors.options?.[i]?.message ? (
                  <p className="text-xs text-red-400 sm:col-span-full">{errors.options[i]?.message}</p>
                ) : null}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-border/60 bg-surface-primary/80"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>
            <Button type="submit" className="bg-brand text-white hover:bg-brand/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Spremanje…
                </>
              ) : mode === "create" ? (
                "Dodaj pitanje"
              ) : (
                "Sačuvaj izmjene"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
