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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, type JSX } from "react";

import { generateId } from "@/admin/content-editor/store/contentEditorStore";
import type { EditorLesson, EditorQuizQuestion, QuizQuestionType } from "@/admin/content-editor/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function SortableQuestion({
  q,
  onChange,
  onRemove,
}: {
  readonly q: EditorQuizQuestion;
  readonly onChange: (next: EditorQuizQuestion) => void;
  readonly onRemove: () => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: q.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border/40 bg-surface-secondary/50 p-3",
        isDragging && "opacity-90 ring-2 ring-brand/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab text-text-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={q.type}
              onChange={(e) => {
                const v = e.target.value as QuizQuestionType;
                if (v === "true_false") {
                  onChange({
                    ...q,
                    type: v,
                    answers: [
                      { id: "t", label: "Tačno" },
                      { id: "f", label: "Netačno" },
                    ],
                    correctAnswerId: "t",
                  });
                } else {
                  onChange({
                    ...q,
                    type: v,
                    answers:
                      q.answers.length >= 2
                        ? q.answers
                        : [
                            { id: generateId(), label: "Odgovor A" },
                            { id: generateId(), label: "Odgovor B" },
                          ],
                    correctAnswerId: null,
                  });
                }
              }}
              className="h-8 w-44 rounded-md border border-border/40 bg-surface-primary px-2 text-xs text-text-primary"
            >
              <option value="multiple_choice">Višestruki izbor</option>
              <option value="true_false">Tačno / netačno</option>
            </select>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-400"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            value={q.prompt}
            onChange={(e) => onChange({ ...q, prompt: e.target.value })}
            placeholder="Tekst pitanja"
            className="border-border/40 bg-surface-primary text-sm text-text-primary"
          />
          {q.type === "multiple_choice" ? (
            <ul className="space-y-1.5">
              {q.answers.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctAnswerId === a.id}
                    onChange={() => onChange({ ...q, correctAnswerId: a.id })}
                    className="text-brand"
                  />
                  <Input
                    value={a.label}
                    onChange={(e) =>
                      onChange({
                        ...q,
                        answers: q.answers.map((x) =>
                          x.id === a.id ? { ...x, label: e.target.value } : x,
                        ),
                      })
                    }
                    className="h-8 border-border/40 bg-surface-primary text-sm"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex gap-4 text-sm text-text-secondary">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`tf-${q.id}`}
                  checked={q.correctAnswerId === "t"}
                  onChange={() =>
                    onChange({
                      ...q,
                      answers: [
                        { id: "t", label: "Tačno" },
                        { id: "f", label: "Netačno" },
                      ],
                      correctAnswerId: "t",
                    })
                  }
                />
                Tačno
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`tf-${q.id}`}
                  checked={q.correctAnswerId === "f"}
                  onChange={() =>
                    onChange({
                      ...q,
                      answers: [
                        { id: "t", label: "Tačno" },
                        { id: "f", label: "Netačno" },
                      ],
                      correctAnswerId: "f",
                    })
                  }
                />
                Netačno
              </label>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function QuizLessonPanel({
  lesson,
  onReplaceQuiz,
  onReorderQuestions,
  onAddQuestion,
}: {
  readonly lesson: EditorLesson;
  readonly onReplaceQuiz: (quiz: EditorLesson["quiz"]) => void;
  readonly onReorderQuestions: (activeId: string, overId: string) => void;
  readonly onAddQuestion: () => void;
}): JSX.Element {
  const { quiz } = lesson;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) {
        return;
      }
      onReorderQuestions(String(active.id), String(over.id));
    },
    [onReorderQuestions],
  );

  const patchQ = (id: string, next: EditorQuizQuestion) => {
    onReplaceQuiz({
      ...quiz,
      questions: quiz.questions.map((x) => (x.id === id ? next : x)),
    });
  };

  const removeQ = (id: string) => {
    onReplaceQuiz({
      ...quiz,
      questions: quiz.questions.filter((x) => x.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <Input
        value={quiz.title}
        onChange={(e) => onReplaceQuiz({ ...quiz, title: e.target.value })}
        className="border-border/40 bg-surface-secondary text-lg font-semibold text-text-primary"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-text-muted">Ciljni broj pitanja</Label>
          <Input
            type="number"
            min={1}
            value={quiz.questionCountTarget}
            onChange={(e) =>
              onReplaceQuiz({ ...quiz, questionCountTarget: Number(e.target.value) || 1 })
            }
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
        <div>
          <Label className="text-text-muted">Prolaznost %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={quiz.passingScorePct}
            onChange={(e) =>
              onReplaceQuiz({ ...quiz, passingScorePct: Number(e.target.value) || 0 })
            }
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
        <div>
          <Label className="text-text-muted">Limit (min)</Label>
          <Input
            type="number"
            min={1}
            value={quiz.timeLimitMinutes}
            onChange={(e) =>
              onReplaceQuiz({ ...quiz, timeLimitMinutes: Number(e.target.value) || 1 })
            }
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
        <div>
          <Label className="text-text-muted">Pokušaji</Label>
          <Input
            type="number"
            min={1}
            value={quiz.maxAttempts}
            onChange={(e) =>
              onReplaceQuiz({ ...quiz, maxAttempts: Number(e.target.value) || 1 })
            }
            className="mt-1 border-border/40 bg-surface-secondary"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Pitanja</h3>
        <Button type="button" size="sm" className="bg-brand-solid text-white hover:bg-brand-hover" onClick={onAddQuestion}>
          <Plus className="mr-1 h-4 w-4" />
          Dodaj pitanje
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={quiz.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {quiz.questions.map((q) => (
              <SortableQuestion
                key={q.id}
                q={q}
                onChange={(n) => patchQ(q.id, n)}
                onRemove={() => removeQ(q.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
