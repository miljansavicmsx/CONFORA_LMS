import { CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";
import { submitLearnerComplaint } from "@/lib/api/complaints-client";
import type { CaseCategory } from "@/lib/api/complaints-types";

const CATEGORY_VALUES = [
  "complaint",
  "technical_support",
  "improvement_proposal",
  "training_proposal",
] as const satisfies ReadonlyArray<Exclude<CaseCategory, "appeal">>;

export type FormalComplaintDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
  readonly certificationApplicationId?: string;
  readonly certificationDecisionId?: string;
  readonly certificateId?: string;
};

function isNormalizedApiError(err: unknown): err is NormalizedApiError {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as NormalizedApiError).code === "string"
  );
}

export function FormalComplaintDialog({
  open,
  onOpenChange,
  onSuccess,
  certificationApplicationId,
  certificationDecisionId,
  certificateId,
}: FormalComplaintDialogProps): JSX.Element {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);
  const qc = useQueryClient();
  const [category, setCategory] = useState<(typeof CATEGORY_VALUES)[number]>("complaint");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFormError(null);
      setSuccessRef(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const base = {
        category,
        subject: subject.trim(),
        description: description.trim(),
      };
      const extra: {
        certificationApplicationId?: string;
        certificationDecisionId?: string;
        certificateId?: string;
      } = {};
      const a = certificationApplicationId?.trim();
      const d = certificationDecisionId?.trim();
      const c = certificateId?.trim();
      if (a) {
        extra.certificationApplicationId = a;
      }
      if (d) {
        extra.certificationDecisionId = d;
      }
      if (c) {
        extra.certificateId = c;
      }
      return submitLearnerComplaint({ ...base, ...extra });
    },
    onSuccess: async (row) => {
      await qc.invalidateQueries({ queryKey: ["myComplaints"] });
      setSubject("");
      setDescription("");
      setFormError(null);
      setSuccessRef(row.publicReference || row.complaintId);
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const normalized = isNormalizedApiError(err) ? err : normalizeApiError(err);
      const key = `complaintsFiling.errors.${normalized.code}`;
      const translated = t(key, { defaultValue: "" });
      setFormError(translated || t("complaintsFiling.errors.HTTP_ERROR"));
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim() || !description.trim()) {
      setFormError(t("complaintsFiling.validation.required"));
      return;
    }
    mutation.mutate();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSuccessRef(null);
      setFormError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg"
        data-testid="learner-complaint-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">{t("complaintsFiling.title")}</DialogTitle>
          <DialogDescription className="text-text-secondary">
            {t("complaintsFiling.description")}
          </DialogDescription>
        </DialogHeader>

        {successRef ? (
          <div
            className="space-y-4 rounded-md border border-emerald-500/30 bg-emerald-950/40 p-4"
            role="status"
            data-testid="learner-complaint-success"
          >
            <p className="text-sm text-emerald-100">{t("complaintsFiling.success.message")}</p>
            <p className="font-mono text-xs text-emerald-50/90">
              {t("complaintsFiling.success.reference", { reference: successRef })}
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)} data-testid="learner-complaint-success-close">
                {t("complaintsFiling.success.close")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p
              className="rounded-md border border-border/50 bg-surface-secondary/50 px-3 py-2 text-xs text-text-secondary"
              data-testid="learner-complaint-identity-disclosure"
            >
              {t("complaintsFiling.identityDisclosure")}
            </p>
            <div className="space-y-2">
              <Label className="text-text-secondary" htmlFor="fc-category">
                {t("complaintsFiling.categoryLabel")}
              </Label>
              <select
                id="fc-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as (typeof CATEGORY_VALUES)[number]);
                }}
                className="h-10 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 text-sm text-text-primary"
                data-testid="learner-complaint-category"
              >
                {CATEGORY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`complaintsFiling.categories.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-subject" className="text-text-secondary">
                {t("complaintsFiling.subjectLabel")}
              </Label>
              <input
                id="fc-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
                maxLength={500}
                required
                aria-required="true"
                data-testid="learner-complaint-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-desc" className="text-text-secondary">
                {t("complaintsFiling.descriptionLabel")}
              </Label>
              <textarea
                id="fc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
                required
                aria-required="true"
                data-testid="learner-complaint-description"
              />
            </div>
            {formError ? (
              <p className="text-sm text-red-200" role="alert" data-testid="learner-complaint-error">
                {formError}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t("complaintsFiling.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="learner-complaint-submit">
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                {mutation.isPending ? t("complaintsFiling.submitting") : t("complaintsFiling.submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
