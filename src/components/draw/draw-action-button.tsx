"use client";

import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetButton } from "@/components/draw/reset-button";
import { useDraw } from "@/context/draw-context";

export function DrawActionButton() {
  const { state, startDraw, stopDraw } = useDraw();
  const { status, isStopping, currentPrize, prizes } = state;
  const isRolling = status === "rolling";
  const canStart = status === "idle" || status === "celebrating";

  const activePrizes = prizes.filter((p) => p.isActive);
  const allPrizesComplete =
    activePrizes.length > 0 && activePrizes.every((p) => p.awardedCount >= p.quantity);

  if (allPrizesComplete) {
    return (
      <ResetButton variant="secondary" className="h-16 w-full max-w-md text-xl">
        <RotateCcw className="size-6" /> Reset &amp; Run Again
      </ResetButton>
    );
  }

  if (isRolling) {
    return (
      <Button
        variant="destructive"
        onClick={stopDraw}
        disabled={isStopping}
        className="h-16 w-full max-w-md text-xl"
      >
        <Square className="size-6" /> {isStopping ? "Stopping…" : "Stop Draw"}
      </Button>
    );
  }

  return (
    <Button
      onClick={startDraw}
      disabled={!canStart || !currentPrize}
      className="h-16 w-full max-w-md text-xl"
    >
      <Play className="size-6" /> Start Draw
    </Button>
  );
}
