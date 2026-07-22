"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WinnerHistory } from "@/components/draw/winner-history";
import { cn } from "@/lib/utils";

type Props = {
  /** Controlled dialog state, e.g. so a parent can track it alongside other open dialogs. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function WinnerHistoryDialog({ open: openProp, onOpenChange, className }: Props = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Recent winners"
            className={cn(className)}
          >
            <Trophy />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Recent winners</TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[70vh] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recent winners</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            <WinnerHistory bare />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
