"use client";

import { Gift } from "lucide-react";
import { useDraw } from "@/context/draw-context";
import { Badge } from "@/components/ui/badge";

export function PrizeBanner() {
  const { currentPrize } = useDraw();

  return (
    <div className="retro-card-sm flex max-w-full flex-wrap items-center justify-center gap-2 bg-secondary px-4 py-2 text-secondary-foreground sm:gap-3 sm:px-6 sm:py-2.5">
      <Gift className="size-4" />
      {currentPrize ? (
        <>
          <span className="font-extrabold">{currentPrize.name}</span>
          {currentPrize.description && (
            <span className="hidden text-sm font-medium opacity-80 sm:inline">
              — {currentPrize.description}
            </span>
          )}
          <Badge className="border-2 border-foreground bg-card text-card-foreground">
            {currentPrize.awardedCount}/{currentPrize.quantity} hadiah
          </Badge>
        </>
      ) : (
        <span className="text-sm font-medium">Tidak ada pilihan hadiah</span>
      )}
    </div>
  );
}
