"use client";

import { Gift } from "lucide-react";
import { useDraw } from "@/context/draw-context";
import { Badge } from "@/components/ui/badge";

export function PrizeBanner() {
  const { state } = useDraw();
  const { currentPrize } = state;

  return (
    <div className="retro-card-sm flex items-center justify-center gap-3 bg-secondary px-6 py-2.5 text-secondary-foreground">
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
