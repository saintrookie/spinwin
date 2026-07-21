"use client";

import { Users, UserCheck, Trophy, Gift } from "lucide-react";
import { useDraw } from "@/context/draw-context";
import { cn } from "@/lib/utils";

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="retro-card-sm flex items-center gap-3 px-5 py-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-foreground",
          accent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs font-medium">{label}</div>
        <div className="truncate text-2xl font-extrabold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function StatsPanel() {
  const { state } = useDraw();
  const { stats } = state;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile icon={Users} label="Total participants" value={stats?.total ?? "—"} />
      <StatTile icon={UserCheck} label="Remaining" value={stats?.remaining ?? "—"} />
      <StatTile icon={Trophy} label="Winners drawn" value={stats?.winners ?? "—"} accent />
      <StatTile
        icon={Gift}
        label="Current prize"
        value={stats?.currentPrize ? `${stats.currentPrize.awardedCount}/${stats.currentPrize.quantity}` : "—"}
      />
    </div>
  );
}
