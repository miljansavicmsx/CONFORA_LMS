"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Copy, GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, type JSX } from "react";

import type { EditorLesson, EditorModule } from "@/admin/content-editor/types";
import { useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function lessonIcon(t: EditorLesson["contentType"]): string {
  const m = { text: "📝", video: "🎬", pdf: "📄", quiz: "❓" } as const;
  return m[t];
}

function lessonDurationLabel(l: EditorLesson): string {
  return `${l.durationMinutes}m`;
}

function completenessPct(lesson: EditorLesson): number {
  if (!lesson.title.trim()) {
    return 0;
  }
  switch (lesson.contentType) {
    case "text":
      return lesson.htmlBody.replace(/<[^>]+>/g, "").trim().length > 24 ? 100 : 45;
    case "video":
      return lesson.videoUrl || lesson.videoFileName ? 100 : 35;
    case "pdf":
      return lesson.pdfUrl || lesson.pdfFileName ? 100 : 35;
    case "quiz":
      return lesson.quiz.questions.length > 0 ? 100 : 40;
    default:
      return 50;
  }
}

function moduleCompleteness(mod: EditorModule): number {
  if (!mod.lessons.length) {
    return 0;
  }
  const sum = mod.lessons.reduce((s, l) => s + completenessPct(l), 0);
  return Math.round(sum / mod.lessons.length);
}

function CompletenessDot({ pct }: { readonly pct: number }): JSX.Element {
  const color =
    pct >= 85 ? "bg-emerald-400" : pct >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <span
      className={cn("h-2 w-2 shrink-0 rounded-full ring-2 ring-surface-primary", color)}
      title={`Kompletnost modula oko ${pct}%`}
    />
  );
}

function SortableLessonRow({
  lesson,
  active,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  readonly lesson: EditorLesson;
  readonly active: boolean;
  readonly onSelect: () => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={cn(isDragging && "z-10 opacity-90")}>
      <div
        className={cn(
          "flex h-9 items-center gap-1 rounded-md pr-1 text-sm transition-colors",
          active
            ? "border-l-2 border-brand bg-brand/10 text-text-primary"
            : "text-text-secondary hover:bg-surface-tertiary",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 px-2 text-left"
        >
          <span
            className="cursor-grab touch-none text-text-muted active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-xs" aria-hidden>
            {lessonIcon(lesson.contentType)}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
          <span className="shrink-0 text-xs text-text-muted">{lessonDurationLabel(lesson)}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-text-muted hover:bg-white/10 hover:text-text-primary"
              aria-label="Meni lekcije"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-border/60 bg-surface-secondary text-text-primary">
            <DropdownMenuItem className="focus:bg-white/10" onClick={onDuplicate}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Dupliciraj
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 focus:bg-white/10" onClick={onDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Obriši
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function SortableModuleCard({
  mod,
  selectedLessonId,
  onSelectLesson,
}: {
  readonly mod: EditorModule;
  readonly selectedLessonId: string | null;
  readonly onSelectLesson: (id: string) => void;
}): JSX.Element {
  const duplicateLesson = useContentEditorStore((s) => s.duplicateLesson);
  const deleteLesson = useContentEditorStore((s) => s.deleteLesson);
  const deleteModule = useContentEditorStore((s) => s.deleteModule);
  const addLesson = useContentEditorStore((s) => s.addLesson);
  const updateModuleTitle = useContentEditorStore((s) => s.updateModuleTitle);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pct = moduleCompleteness(mod);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 rounded-lg bg-surface-secondary p-3",
        isDragging && "z-20 opacity-95 ring-2 ring-brand/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-text-muted hover:text-text-secondary active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Pomjeri modul"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand">{mod.order}.</span>
            <Input
              value={mod.title}
              onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
              className="h-7 border-0 bg-transparent px-0 text-sm font-semibold text-text-primary focus-visible:ring-0"
            />
            <CompletenessDot pct={pct} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-muted hover:bg-white/10 hover:text-brand"
            title="Dodaj lekciju"
            onClick={() => addLesson(mod.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-muted hover:bg-white/10"
                aria-label="Meni modula"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border/60 bg-surface-secondary text-text-primary"
            >
              <DropdownMenuItem
                className="focus:bg-white/10"
                onClick={() => addLesson(mod.id)}
              >
                Dodaj lekciju
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                className="text-red-400 focus:bg-white/10 focus:text-red-300"
                onClick={() => deleteModule(mod.id)}
              >
                Obriši modul
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext items={mod.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <ul className="mt-2 space-y-0.5 border-l border-border/20 pl-2">
          {mod.lessons.map((lesson) => (
            <SortableLessonRow
              key={lesson.id}
              lesson={lesson}
              active={lesson.id === selectedLessonId}
              onSelect={() => onSelectLesson(lesson.id)}
              onDuplicate={() => duplicateLesson(lesson.id)}
              onDelete={() => deleteLesson(lesson.id)}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}

export function StructureTreePanel(): JSX.Element {
  const modules = useContentEditorStore((s) => s.modules);
  const selectedLessonId = useContentEditorStore((s) => s.selectedLessonId);
  const selectLesson = useContentEditorStore((s) => s.selectLesson);
  const addModule = useContentEditorStore((s) => s.addModule);
  const reorderModules = useContentEditorStore((s) => s.reorderModules);
  const reorderLessons = useContentEditorStore((s) => s.reorderLessons);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }
      const aid = String(active.id);
      const oid = String(over.id);
      const isMod = (x: string) => modules.some((m) => m.id === x);
      const isLes = (x: string) => modules.some((m) => m.lessons.some((l) => l.id === x));
      if (isMod(aid) && isMod(oid)) {
        reorderModules(aid, oid);
        return;
      }
      if (isLes(aid) && isLes(oid)) {
        reorderLessons(aid, oid);
      }
    },
    [modules, reorderLessons, reorderModules],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border/20 bg-surface-primary">
        <div className="flex items-center justify-between border-b border-border/20 px-3 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Poglavlja · tačke
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand hover:bg-brand/10"
            title="Novi modul"
            onClick={() => addModule()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((mod) => (
              <SortableModuleCard
                key={mod.id}
                mod={mod}
                selectedLessonId={selectedLessonId}
                onSelectLesson={(id) => selectLesson(id)}
              />
            ))}
          </SortableContext>
        </div>

        <motion.div className="border-t border-border/20 p-2" layout>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-border/50 bg-transparent text-text-secondary hover:border-brand hover:bg-brand/5 hover:text-brand"
            onClick={() => addModule()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Dodaj modul
          </Button>
        </motion.div>
      </aside>
    </DndContext>
  );
}
