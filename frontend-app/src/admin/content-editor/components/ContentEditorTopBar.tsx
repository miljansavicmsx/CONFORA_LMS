"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEPS = ["Osnovni podaci", "Sadržaj", "Pregled"] as const;

export function ContentEditorTopBar({
  courseTitle,
  onCourseTitleChange,
  activeStepIndex,
  lastSavedLabel,
  onPreview,
  onSaveDraft,
  isSaving = false,
  saveDraftDisabled = false,
}: {
  readonly courseTitle: string;
  readonly onCourseTitleChange: (v: string) => void;
  readonly activeStepIndex: number;
  readonly lastSavedLabel: string | null;
  readonly onPreview: () => void;
  readonly onSaveDraft: () => void;
  readonly isSaving?: boolean;
  readonly saveDraftDisabled?: boolean;
}): JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/30 bg-surface-primary/95 px-3 backdrop-blur-md sm:gap-4 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          asChild
        >
          <Link to="/dashboard/admin/kreiraj-kurs">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Nazad na kurseve</span>
          </Link>
        </Button>
        <Input
          value={courseTitle}
          onChange={(e) => onCourseTitleChange(e.target.value)}
          className="h-9 min-w-0 max-w-md border-border/40 bg-surface-secondary text-sm font-medium text-text-primary"
          aria-label="Naziv kursa"
        />
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-xs font-medium text-text-muted">
          {activeStepIndex + 1}
          .
          {" "}
          {STEPS[activeStepIndex] ?? "Sadržaj"}
        </span>
        <div className="flex gap-1.5">
          {STEPS.map((step, i) => (
            <span
              key={step}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i <= activeStepIndex ? "bg-brand" : "bg-surface-tertiary",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {lastSavedLabel ? (
          <motion.span
            key={lastSavedLabel}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="hidden text-xs text-text-muted md:inline"
          >
            Sačuvano
            {" "}
            {lastSavedLabel}
          </motion.span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border/50 bg-transparent text-text-primary hover:bg-white/5"
          onClick={onPreview}
        >
          Pregled
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-brand-solid font-medium text-white hover:bg-brand-hover"
          onClick={onSaveDraft}
          disabled={saveDraftDisabled}
        >
          {isSaving ? "Spremanje…" : "Spremi draft"}
        </Button>
      </div>
    </header>
  );
}
