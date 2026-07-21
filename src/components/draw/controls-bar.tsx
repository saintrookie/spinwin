"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Maximize,
  Minimize,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDraw } from "@/context/draw-context";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { UploadDialog } from "@/components/draw/upload-dialog";
import { SettingsPanel } from "@/components/draw/settings-panel";
import { WinnerHistoryDialog } from "@/components/draw/winner-history-dialog";
import { StatsPanelDialog } from "@/components/draw/stats-panel-dialog";
import { ResetButton } from "@/components/draw/reset-button";

export function ControlsBar() {
  const { state, currentPrize, startDraw, stopDraw, refreshAll } = useDraw();
  const { status } = state;
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { resolvedTheme, setTheme } = useTheme();

  const [controlsOpen, setControlsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard client-mount guard to avoid SSR/client theme-icon hydration mismatch
    setMounted(true);
  }, []);

  const isRolling = status === "rolling";
  const canStart = status === "idle" || status === "celebrating";

  useKeyboardShortcuts(
    {
      space: () => {
        if (isRolling) void stopDraw();
        else if (canStart && currentPrize) startDraw();
      },
      f: toggleFullscreen,
      u: () => setUploadOpen(true),
      d: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      r: () => {
        if (!isRolling) setResetConfirmOpen(true);
      },
    },
    !uploadOpen && !settingsOpen && !resetConfirmOpen && !controlsOpen
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setControlsOpen(true)}
        aria-label="Open controls"
        className="fixed bottom-4 left-4 z-40 border-2 border-foreground bg-card shadow-[3px_3px_0_0_var(--retro-shadow-color)] hover:bg-card"
      >
        <Settings2 />
      </Button>

      <Dialog open={controlsOpen} onOpenChange={setControlsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Controls</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              <Upload /> Upload Excel
            </Button>

            <WinnerHistoryDialog />

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? <Sun /> : mounted ? <Moon /> : null}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Draw settings">
              <SlidersHorizontal />
            </Button>

            <StatsPanelDialog />

            <ResetButton
              variant="ghost"
              size="icon"
              disabled={isRolling}
              aria-label="Reset draw"
              open={resetConfirmOpen}
              onOpenChange={setResetConfirmOpen}
            >
              <RotateCcw />
            </ResetButton>
          </div>
        </DialogContent>
      </Dialog>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onImported={refreshAll} />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
