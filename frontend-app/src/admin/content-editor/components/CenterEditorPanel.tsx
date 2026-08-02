"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useState, type JSX } from "react";
import { Link } from "react-router";

import type { EditorContentType } from "@/admin/content-editor/types";
import {
  findLessonInStore,
  useContentEditorStore,
} from "@/admin/content-editor/store/contentEditorStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { LessonEditorWorkspace } from "./LessonEditorWorkspace";
import { QuizLessonPanel } from "./QuizLessonPanel";

const TABS: { type: EditorContentType; label: string; emoji: string }[] = [
  { type: "text", label: "Tekst", emoji: "📝" },
  { type: "video", label: "Video", emoji: "🎬" },
  { type: "pdf", label: "PDF", emoji: "📄" },
  { type: "quiz", label: "Quiz", emoji: "❓" },
];

export function CenterEditorPanel(): JSX.Element {
  const [aiOpen, setAiOpen] = useState(false);
  const modules = useContentEditorStore((s) => s.modules);
  const selectedLessonId = useContentEditorStore((s) => s.selectedLessonId);
  const updateLessonTitle = useContentEditorStore((s) => s.updateLessonTitle);
  const setLessonContentType = useContentEditorStore((s) => s.setLessonContentType);
  const replaceLessonQuiz = useContentEditorStore((s) => s.replaceLessonQuiz);
  const reorderQuizQuestions = useContentEditorStore((s) => s.reorderQuizQuestions);
  const addQuizQuestion = useContentEditorStore((s) => s.addQuizQuestion);

  const lesson = findLessonInStore(modules, selectedLessonId);

  if (!lesson) {
    return (
      <section
        aria-label="Uređivač sadržaja"
        className="flex min-w-0 flex-1 items-center justify-center bg-surface-primary p-8 text-text-muted"
      >
        Odaberi lekciju u stablu slijeva.
      </section>
    );
  }

  return (
    <section aria-label="Uređivač sadržaja lekcije" className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-primary">
      <div className="sticky top-0 z-10 border-b border-border/20 bg-surface-primary/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <Input
            value={lesson.title}
            onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
            className="border-0 bg-transparent px-0 text-lg font-semibold text-text-primary placeholder:text-text-muted focus-visible:ring-0"
            placeholder="Naslov lekcije"
          />
        </div>
        <div className="relative mx-auto mt-3 flex max-w-3xl flex-wrap items-center gap-2 px-4">
          <div className="flex min-w-0 flex-1 gap-1">
            {TABS.map((tab) => {
              const active = lesson.contentType === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setLessonContentType(lesson.id, tab.type)}
                  className={cn(
                    "relative rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  <span className="mr-1.5">{tab.emoji}</span>
                  {tab.label}
                  {active ? (
                    <motion.span
                      layoutId="editor-tab-underline"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            onClick={() => setAiOpen(true)}
          >
            <Bot className="h-4 w-4" aria-hidden />
            AI asistent
          </Button>
        </div>
      </div>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="border-border/60 bg-surface-secondary text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text-primary">
              <Bot className="h-5 w-5 text-violet-400" aria-hidden />
              AI Item Bank asistent
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Generirajte ili povucite pitanja iz banke pitanja (ISO 17024). Za regulirani sadržaj AI nacrti
              moraju proći ljudsku reviziju prije objave.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              Otvorite{" "}
              <Link
                to="/dashboard/admin/item-bank"
                className="font-medium text-brand underline underline-offset-2"
                onClick={() => setAiOpen(false)}
              >
                Item bank
              </Link>{" "}
              za generiranje, označavanje AI sadržaja i odobrenje.
            </p>
            <p className="text-xs text-text-muted">
              Za kviz ove lekcije: koristite „Pitanja” ispod kad je odabrana tačka tipa Kviz.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <LessonEditorWorkspace lesson={lesson} />
          {lesson.contentType === "quiz" ? (
            <QuizLessonPanel
              lesson={lesson}
              onReplaceQuiz={(quiz) => replaceLessonQuiz(lesson.id, quiz)}
              onReorderQuestions={(a, o) => reorderQuizQuestions(lesson.id, a, o)}
              onAddQuestion={() => addQuizQuestion(lesson.id)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
