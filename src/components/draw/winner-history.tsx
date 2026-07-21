"use client";

import { Trophy } from "lucide-react";
import { useDraw } from "@/context/draw-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { maskFullName } from "@/lib/mask-name";

export function WinnerHistory({ bare = false }: { bare?: boolean }) {
  const { state } = useDraw();
  const { history } = state;

  return (
    <div className={bare ? "flex h-full flex-col" : "retro-card flex h-full flex-col p-4"}>
      {!bare && (
        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-foreground">
          <Trophy className="size-4 text-primary" />
          Recent winners
        </div>
      )}
      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No winners yet</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((winner) => (
              <li
                key={winner.id}
                className="flex items-center justify-between gap-2 rounded-lg border-2 border-foreground/15 bg-muted/50 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-bold text-foreground">
                    {maskFullName(winner.participant.fullName)}
                  </div>
                  <div className="truncate font-mono text-muted-foreground text-xs">
                    {winner.participant.plateNumber ?? "—"}
                  </div>
                </div>
                <span className="shrink-0 rounded-md border-2 border-foreground bg-primary px-2 py-0.5 text-primary-foreground text-xs font-bold">
                  {winner.prize.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
