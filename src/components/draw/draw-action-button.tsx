"use client";

import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetButton } from "@/components/draw/reset-button";
import { useDraw } from "@/context/draw-context";

export function DrawActionButton() {
  const { state, currentPrize, startDraw, stopDraw } = useDraw();
  const { status, isStopping, prizes } = state;
  const isRolling = status === "rolling";
  const canStart = status === "idle" || status === "celebrating";

  const activePrizes = prizes.filter((p) => p.isActive);
  const allPrizesComplete =
    activePrizes.length > 0 && activePrizes.every((p) => p.awardedCount >= p.quantity);

  if (allPrizesComplete) {
    return (
      <ResetButton
        variant="secondary"
        className="h-auto min-h-16 w-full max-w-xl whitespace-normal py-3 text-lg sm:min-h-24 sm:text-3xl"
      >
        <RotateCcw className="size-6 sm:size-9" /> Reset &amp; Run Again
      </ResetButton>
    );
  }

  if (isRolling) {
    return (
      <Button
        variant="destructive"
        onClick={stopDraw}
        disabled={isStopping}
        className="h-16 w-full max-w-xl text-lg sm:h-24 sm:text-3xl"
      >
        <Square className="size-6 sm:size-9" /> {isStopping ? "Berhenti..." : "Hentikan"}
      </Button>
    );
  }

  return (
    <Button
      onClick={startDraw}
      disabled={!canStart || !currentPrize}
      className="h-16 w-full max-w-xl text-lg sm:h-24 sm:text-3xl"
    >
      <Play className="size-6 sm:size-9" /> Mulai
    </Button>
  );
}
