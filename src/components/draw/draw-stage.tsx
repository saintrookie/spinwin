"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraw } from "@/context/draw-context";
import { playSound } from "@/lib/sound";
import { fireWinnerConfetti } from "@/lib/confetti";
import { Car, Sparkles } from "lucide-react";
import type { RollCandidate } from "@/types/domain";
import { cn } from "@/lib/utils";
import { maskFullName } from "@/lib/mask-name";

type Display = { name: string; plateNumber: string | null };

function randomCandidate(pool: RollCandidate[]): RollCandidate | null {
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function DrawStage() {
  const { state } = useDraw();
  const { status, isStopping, rollPool, lastWinner, settings } = state;
  const [rollingDisplay, setRollingDisplay] = useState<Display | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiFiredForRef = useRef<string | null>(null);

  const rollSpeedMs = settings?.rollSpeedMs ?? 60;
  const rollDurationMs = settings?.rollDurationMs ?? 4000;
  const soundEnabled = settings?.soundEnabled ?? true;
  const confettiEnabled = settings?.confettiEnabled ?? true;

  useEffect(() => {
    const clear = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };

    if (status === "rolling" && !isStopping) {
      const tick = () => {
        const candidate = randomCandidate(rollPool);
        if (candidate) {
          setRollingDisplay({ name: maskFullName(candidate.fullName), plateNumber: candidate.plateNumber });
          if (soundEnabled) playSound("tick");
        }
        timeoutRef.current = setTimeout(tick, rollSpeedMs);
      };
      tick();
      return clear;
    }

    if (status === "rolling" && isStopping) {
      const startedAt = Date.now();
      let delay = rollSpeedMs;
      const tick = () => {
        const elapsed = Date.now() - startedAt;
        const candidate = randomCandidate(rollPool);
        if (candidate) {
          setRollingDisplay({ name: maskFullName(candidate.fullName), plateNumber: candidate.plateNumber });
          if (soundEnabled) playSound("tick");
        }
        if (elapsed >= rollDurationMs) return;
        delay = Math.min(delay * 1.14, 420);
        timeoutRef.current = setTimeout(tick, delay);
      };
      tick();
      return clear;
    }

    clear();
    return clear;
  }, [status, isStopping, rollPool, rollSpeedMs, rollDurationMs, soundEnabled]);

  useEffect(() => {
    if ((status === "revealing" || status === "celebrating") && lastWinner) {
      if (confettiFiredForRef.current !== lastWinner.winnerId) {
        confettiFiredForRef.current = lastWinner.winnerId;
        if (soundEnabled) playSound("win");
        if (confettiEnabled) fireWinnerConfetti();
      }
    }
    if (status === "idle") {
      confettiFiredForRef.current = null;
    }
  }, [status, lastWinner, soundEnabled, confettiEnabled]);

  const isRevealed = status === "revealing" || status === "celebrating";
  const isRolling = status === "rolling";
  const reduceMotion = useReducedMotion();

  const display: Display | null = isRevealed && lastWinner
    ? { name: maskFullName(lastWinner.fullName), plateNumber: lastWinner.plateNumber }
    : isRolling
      ? rollingDisplay
      : null;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6">
      <p className="sr-only" role="status" aria-live="polite">
        {isRevealed && lastWinner
          ? `Winner: ${maskFullName(lastWinner.fullName)}${lastWinner.plateNumber ? `, plate ${lastWinner.plateNumber}` : ""}`
          : ""}
      </p>
      <div
        className={cn(
          "retro-card w-full max-w-4xl px-8 py-14 text-center transition-transform duration-300",
          isRevealed && "-rotate-1 scale-[1.02] border-primary"
        )}
      >
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="size-4" />
          {isRevealed ? "Winner" : isRolling ? "Drawing…" : "Ready"}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={display?.name ?? "empty"}
            initial={reduceMotion ? false : { opacity: 0, y: isRolling ? 8 : 24, scale: isRevealed ? 0.9 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: isRolling ? -8 : -12 }}
            transition={{ duration: reduceMotion ? 0 : isRolling ? 0.05 : 0.4, ease: "easeOut" }}
            className={cn(
              "font-extrabold leading-tight text-foreground",
              "text-[clamp(2.25rem,6vw,5.5rem)]",
              isRevealed && "text-primary"
            )}
          >
            {display?.name ?? "—"}
          </motion.div>
        </AnimatePresence>

        {display?.plateNumber && (
          <div className="mt-5 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-lg border-2 border-foreground bg-secondary px-4 py-1.5 font-mono font-bold tracking-widest text-secondary-foreground text-[clamp(1rem,1.6vw,1.375rem)]">
              <Car className="size-5" /> {display.plateNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
