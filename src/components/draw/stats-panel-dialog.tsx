"use client";

import { useState } from "react";
import { ChartColumn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatsPanel } from "@/components/draw/stats-panel";
import { cn } from "@/lib/utils";

type Props = {
  /** Controlled dialog state, e.g. so a parent can track it alongside other open dialogs. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function StatsPanelDialog({ open: openProp, onOpenChange, className }: Props = {}) {
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
            aria-label="Draw statistics"
            className={cn(className)}
          >
            <ChartColumn />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Draw statistics</TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Statistics</DialogTitle>
          </DialogHeader>
          <StatsPanel compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
