"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, Car, X } from "lucide-react";
import { useDraw } from "@/context/draw-context";
import { Button } from "@/components/ui/button";
import { maskFullName } from "@/lib/mask-name";

export function WinnerModal() {
  const { state, returnToIdle } = useDraw();
  const { status, lastWinner, lastWinnerPrizeName } = state;
  const open = (status === "revealing" || status === "celebrating") && Boolean(lastWinner);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") returnToIdle();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, returnToIdle]);

  return (
    <AnimatePresence>
      {open && lastWinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Winner announcement"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="retro-card relative w-full max-w-xl border-primary p-10 text-center"
          >
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={returnToIdle}
              aria-label="Close"
            >
              <X />
            </Button>

            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-secondary-foreground">
              <PartyPopper className="size-7" />
            </div>

            <p className="mb-1 text-sm font-bold uppercase tracking-[0.3em] text-primary">
              {lastWinnerPrizeName ?? "Winner"}
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight text-foreground">
              {maskFullName(lastWinner.fullName)}
            </h2>

            {lastWinner.plateNumber && (
              <div className="mt-4 flex items-center justify-center">
                <span className="flex items-center gap-2 rounded-lg border-2 border-foreground bg-secondary px-4 py-1.5 font-mono font-bold tracking-widest text-secondary-foreground">
                  <Car className="size-4" /> {lastWinner.plateNumber}
                </span>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" onClick={returnToIdle}>
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
