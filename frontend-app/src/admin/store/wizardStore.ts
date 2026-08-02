import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Step1BasicInfoFormValues,
  step1DefaultValues,
} from "@/admin/schemas/step1BasicInfoSchema";

interface WizardStoreState {
  readonly step1: Step1BasicInfoFormValues;
  setStep1: (partial: Partial<Step1BasicInfoFormValues>) => void;
  setStep1Full: (values: Step1BasicInfoFormValues) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardStoreState>()(
  persist(
    (set) => ({
      step1: { ...step1DefaultValues },
      setStep1: (partial) =>
        set((s) => ({
          step1: { ...s.step1, ...partial },
        })),
      setStep1Full: (values) => set({ step1: { ...values } }),
      resetWizard: () => set({ step1: { ...step1DefaultValues } }),
    }),
    {
      name: "confora-course-wizard",
      partialize: (s) => ({ step1: s.step1 }),
    },
  ),
);
