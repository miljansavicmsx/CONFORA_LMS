"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading1, Heading2, Italic, List } from "lucide-react";
import { useEffect, useRef, type JSX, type ReactNode } from "react";

import { useDebouncedLessonPatch } from "@/admin/content-editor/lib/debouncedPatch";
import { useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import type { EditorLesson } from "@/admin/content-editor/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  readonly onClick: () => void;
  readonly active?: boolean;
  readonly title: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      onClick={onClick}
      className={cn(
        "h-8 w-8 text-text-muted hover:bg-white/10 hover:text-text-primary",
        active && "bg-brand/15 text-brand",
      )}
    >
      {children}
    </Button>
  );
}

export function TextLessonEditor({ lesson }: { readonly lesson: EditorLesson }): JSX.Element {
  const patchLesson = useContentEditorStore((s) => s.patchLesson);
  const { schedule, flushPending, cancelPending } = useDebouncedLessonPatch(lesson.id, patchLesson);
  const lastExternal = useRef(lesson.htmlBody);
  const flushRef = useRef(flushPending);
  flushRef.current = flushPending;
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        bulletList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({
        placeholder: "Piši sadržaj lekcije…",
      }),
    ],
    content: lesson.htmlBody,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[320px] px-2 py-4 focus:outline-none prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary",
      },
    },
    onUpdate: ({ editor: ed }) => {
      scheduleRef.current({ htmlBody: ed.getHTML() });
    },
    onBlur: () => {
      flushRef.current();
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (lesson.htmlBody !== lastExternal.current && lesson.htmlBody !== editor.getHTML()) {
      cancelPending();
      editor.commands.setContent(lesson.htmlBody, { emitUpdate: false });
    }
    lastExternal.current = lesson.htmlBody;
  }, [lesson.htmlBody, lesson.id, editor, cancelPending]);

  useEffect(() => {
    lastExternal.current = lesson.htmlBody;
  }, [lesson.id, lesson.htmlBody]);

  if (!editor) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-xl border border-border/30 bg-surface-secondary/50" aria-hidden />
    );
  }

  return (
    <div className="rounded-xl border border-border/30 bg-surface-secondary/40">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border/30 bg-surface-primary/95 px-2 py-2 backdrop-blur-md">
        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <Separator orientation="vertical" className="mx-1 h-6 bg-border/40" />
        <ToolbarBtn
          title="Naslov 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Naslov 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <Separator orientation="vertical" className="mx-1 h-6 bg-border/40" />
        <ToolbarBtn
          title="Lista s grafičkim oznakama"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
