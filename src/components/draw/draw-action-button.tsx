"use client";

import { Play, Square, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetButton } from "@/components/draw/reset-button";
import { useDraw } from "@/context/draw-context";

export function DrawActionButton() {
  const { state, currentPrize, startDraw, stopDraw, returnToIdle } = useDraw();
  const { status, isStopping, prizes } = state;
  const isRolling = status === "rolling";
  const isRevealed = status === "revealing" || status === "celebrating";
  const canStart = status === "idle" || status === "celebrating";

  const activePrizes = prizes.filter((p) => p.isActive);
  const allPrizesComplete =
    activePrizes.length > 0 && activePrizes.every((p) => p.awardedCount >= p.quantity);

  if (isRevealed) {
    return (
      <Button
        onClick={returnToIdle}
        className="h-16 w-full max-w-xl bg-gradient-to-b from-primary to-primary/80 text-lg shadow-[3px_3px_0_0_var(--retro-shadow-color),0_0_30px_-8px_var(--primary)] sm:h-24 sm:text-3xl"
      >
        Lanjutkan <ArrowRight data-icon="inline-end" className="size-6 sm:size-9" />
      </Button>
    );
  }

  if (allPrizesComplete) {
    return (
      <ResetButton
        variant="secondary"
        className="h-auto min-h-16 w-full max-w-xl whitespace-normal bg-gradient-to-b from-secondary to-secondary/80 py-3 text-lg shadow-[3px_3px_0_0_var(--retro-shadow-color),0_0_25px_-8px_var(--secondary)] sm:min-h-24 sm:text-3xl"
      >
        <RotateCcw data-icon="inline-start" className="size-6 sm:size-9" /> Reset &amp; Run Again
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
        <Square data-icon="inline-start" className="size-6 sm:size-9" /> {isStopping ? "Berhenti..." : "Hentikan"}
      </Button>
    );
  }

  return (
    <Button
      onClick={startDraw}
      disabled={!canStart || !currentPrize}
      className="h-16 w-full max-w-xl bg-gradient-to-b from-primary to-primary/80 text-lg shadow-[3px_3px_0_0_var(--retro-shadow-color),0_0_30px_-8px_var(--primary)] sm:h-24 sm:text-3xl"
    >
      <Play data-icon="inline-start" className="size-6 sm:size-9" /> Mulai
    </Button>
  );
}
