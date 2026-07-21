"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraw } from "@/context/draw-context";
import { playSound } from "@/lib/sound";
import { fireWinnerConfetti } from "@/lib/confetti";
import { Gift, Sparkles } from "lucide-react";
import type { RollCandidate } from "@/types/domain";
import { cn } from "@/lib/utils";
import { maskFullName } from "@/lib/mask-name";

type Display = { key: string; name: string; plateNumber: string | null };

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
  const tickCounterRef = useRef(0);

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
          tickCounterRef.current += 1;
          setRollingDisplay({
            key: `tick-${tickCounterRef.current}`,
            name: maskFullName(candidate.fullName),
            plateNumber: candidate.plateNumber,
          });
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
          tickCounterRef.current += 1;
          setRollingDisplay({
            key: `tick-${tickCounterRef.current}`,
            name: maskFullName(candidate.fullName),
            plateNumber: candidate.plateNumber,
          });
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
    ? { key: lastWinner.winnerId, name: maskFullName(lastWinner.fullName), plateNumber: lastWinner.plateNumber }
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
          "retro-card flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-8 py-16 text-center transition-transform duration-300",
          isRevealed && "-rotate-1 scale-[1.02] border-primary"
        )}
      >
        <div className="mb-8 flex items-center justify-center gap-2 text-base font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="size-5" />
          {isRevealed ? "Pemenang" : isRolling ? "Pengundian Berjalan..." : "Ready"}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={display?.key ?? "empty"}
            initial={reduceMotion ? false : { opacity: 0, y: isRolling ? 8 : 24, scale: isRevealed ? 0.9 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: isRolling ? -8 : -12 }}
            transition={{ duration: reduceMotion ? 0 : isRolling ? 0.05 : 0.4, ease: "easeOut" }}
            className={cn(
              "flex items-center justify-center gap-4 font-mono font-extrabold leading-tight tracking-widest text-foreground",
              "text-[clamp(3rem,9vw,8rem)]",
              isRevealed && "text-primary"
            )}
          >
            {!isRolling && <Gift className="size-[0.6em] shrink-0" />}
            {display?.plateNumber ?? ""}
          </motion.div>
        </AnimatePresence>

        {display?.name && (
          <div className="mt-8 flex items-center justify-center">
            <span className="rounded-lg border-2 border-foreground bg-secondary px-5 py-2 font-bold tracking-wide text-secondary-foreground text-[clamp(1.125rem,2.2vw,1.75rem)]">
              {display.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
