"use client";

import { ArrowLeft, Menu, MoreVertical, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { JSX } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ds } from "@/design-system/tokens";

export function CoursePlayerHeader({
  courseTitle,
  lessonTitle,
  lessonIndexDisplay,
  totalLessons,
  tocOpen,
  onToggleToc,
  notesOpen,
  onToggleNotes,
}: {
  readonly courseTitle: string;
  readonly lessonTitle: string;
  readonly lessonIndexDisplay: number;
  readonly totalLessons: number;
  readonly tocOpen: boolean;
  readonly onToggleToc: () => void;
  readonly notesOpen: boolean;
  readonly onToggleNotes: () => void;
}): JSX.Element {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        ds.semantics.learning.accentBar,
        "fixed inset-x-0 top-0 z-[70] flex h-14 shrink-0 items-center gap-2 border-b border-border/20 bg-surface-primary/95 px-2 pl-3 backdrop-blur-md sm:h-[3.65rem] sm:gap-3 sm:px-4 sm:pl-5",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 md:max-w-[38%]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-text-secondary hover:bg-white/5 hover:text-text-primary md:hidden"
          aria-label={tocOpen ? "Sakrij sadržaj" : "Prikaži sadržaj"}
          onClick={onToggleToc}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          aria-label="Nazad na nadzornu ploču"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="min-w-0 truncate text-sm font-medium text-text-secondary">
          {courseTitle}
        </p>
      </div>

      <div className="hidden min-w-0 flex-[1.2] justify-center px-2 md:flex">
        <h1 className="truncate text-center text-base font-medium text-text-primary">
          {lessonTitle}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:max-w-[38%]">
        <p className="hidden text-xs tabular-nums text-text-muted sm:block sm:text-sm">
          <span className="font-semibold text-text-secondary">{lessonIndexDisplay}</span>
          <span className="text-text-muted"> / </span>
          <span>{totalLessons}</span>
          <span className="sr-only"> lekcija</span>
        </p>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 text-text-secondary hover:bg-white/5 hover:text-text-primary xl:flex"
          aria-label={notesOpen ? "Sakrij bilješke" : "Prikaži bilješke"}
          onClick={onToggleNotes}
        >
          {notesOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-text-secondary hover:bg-white/5 hover:text-text-primary"
              aria-label="Više opcija"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-border/60 bg-surface-secondary text-text-primary">
            <DropdownMenuItem
              className="focus:bg-white/10"
              onClick={() => navigate("/dashboard")}
            >
              Nadzorna ploča
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-white/10" onClick={() => navigate("/dashboard")}>
              Dostupni kursevi
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem className="focus:bg-white/10" onClick={() => navigate("/dashboard/postavke")}>
              Postavke
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h1 className="sr-only md:hidden">{lessonTitle}</h1>
    </header>
  );
}
