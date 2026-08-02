import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuditLineageDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  readonly open: boolean;
  readonly onOpenChange: (o: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}): ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border/50 bg-surface-primary text-text-primary">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-text-secondary">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
