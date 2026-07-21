import { DrawProvider } from "@/context/draw-context";
import { PrizeBanner } from "@/components/draw/prize-banner";
import { StatsPanel } from "@/components/draw/stats-panel";
import { DrawStage } from "@/components/draw/draw-stage";
import { DrawActionButton } from "@/components/draw/draw-action-button";
import { ControlsBar } from "@/components/draw/controls-bar";
import { WinnerModal } from "@/components/draw/winner-modal";

export default function Home() {
  return (
    <DrawProvider>
      <WinnerModal />
      <div className="relative flex h-dvh flex-col overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 -z-10 retro-dots" />

        <header className="flex flex-col items-center gap-3 px-4 pt-4">
          <h1 className="text-center font-extrabold uppercase tracking-wide text-foreground text-[clamp(1.5rem,4vw,2.75rem)]">
            Apresiasi Emas
          </h1>
          <PrizeBanner />
        </header>

        <main className="flex flex-1 min-h-0 flex-col gap-4 p-4">
          <StatsPanel />
          <DrawStage />
          <div className="flex justify-center pb-2">
            <DrawActionButton />
          </div>
        </main>

        <ControlsBar />
      </div>
    </DrawProvider>
  );
}
