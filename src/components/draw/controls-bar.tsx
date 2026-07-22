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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
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
    !uploadOpen &&
      !settingsOpen &&
      !resetConfirmOpen &&
      !controlsOpen &&
      !historyOpen &&
      !statsOpen
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setControlsOpen(true)}
            aria-label="Open controls"
            className="fixed bottom-4 left-4 z-40 border-2 border-foreground bg-card shadow-[3px_3px_0_0_var(--retro-shadow-color)] hover:bg-card"
          >
            <Settings2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Controls</TooltipContent>
      </Tooltip>

      <Dialog open={controlsOpen} onOpenChange={setControlsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Controls</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={() => setUploadOpen(true)} className="w-full sm:w-auto sm:self-center">
              <Upload data-icon="inline-start" /> Upload Excel
            </Button>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center">
              <WinnerHistoryDialog
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                className="h-11 w-full sm:size-9"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                    className="h-11 w-full sm:size-9"
                  >
                    {isFullscreen ? <Minimize /> : <Maximize />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? "Exit fullscreen" : "Fullscreen"} (F)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                    className="h-11 w-full sm:size-9"
                  >
                    {mounted && resolvedTheme === "dark" ? <Sun /> : mounted ? <Moon /> : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle theme (D)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                    aria-label="Draw settings"
                    className="h-11 w-full sm:size-9"
                  >
                    <SlidersHorizontal />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Draw settings</TooltipContent>
              </Tooltip>

              <StatsPanelDialog open={statsOpen} onOpenChange={setStatsOpen} className="h-11 w-full sm:size-9" />

              <ResetButton
                variant="ghost"
                size="icon"
                disabled={isRolling}
                aria-label="Reset draw"
                open={resetConfirmOpen}
                onOpenChange={setResetConfirmOpen}
                tooltip="Reset draw (R)"
                className="h-11 w-full sm:size-9"
              >
                <RotateCcw />
              </ResetButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onImported={refreshAll} />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
