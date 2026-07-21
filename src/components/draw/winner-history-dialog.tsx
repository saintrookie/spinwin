"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WinnerHistory } from "@/components/draw/winner-history";

export function WinnerHistoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Recent winners">
        <Trophy />
      </Button>
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
