"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraw } from "@/context/draw-context";
import { playSound } from "@/lib/sound";
import { fireWinnerConfetti } from "@/lib/confetti";
import { Gift, Sparkles } from "lucide-react";
import type { RollCandidate } from "@/types/domain";
import { cn } from "@/lib/utils";

type Display = { key: string; plateNumber: string | null };

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
          setRollingDisplay({ key: `tick-${tickCounterRef.current}`, plateNumber: candidate.plateNumber });
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
          setRollingDisplay({ key: `tick-${tickCounterRef.current}`, plateNumber: candidate.plateNumber });
          if (soundEnabled) playSound("tick");
        }
        // Keep ticking (at the capped slow speed) even past rollDurationMs —
        // if the server response is slower than expected, we'd otherwise
        // freeze on the last candidate instead of animating right up to the
        // real reveal. The effect cleanup cancels this once status changes.
        if (elapsed < rollDurationMs) {
          delay = Math.min(delay * 1.14, 420);
        }
        timeoutRef.current = setTimeout(tick, delay);
      };
      tick();
      return clear;
    }

    clear();
    return clear;
  }, [status, isStopping, rollPool, rollSpeedMs, rollDurationMs, soundEnabled]);

  useEffect(() => {
    if (status !== "rolling") {
      setRollingDisplay(null);
    }
  }, [status]);

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
    ? { key: lastWinner.winnerId, plateNumber: lastWinner.plateNumber }
    : isRolling
      ? rollingDisplay
      : null;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
      <p className="sr-only" role="status" aria-live="polite">
        {isRevealed && lastWinner && lastWinner.plateNumber ? `Winner plate: ${lastWinner.plateNumber}` : ""}
      </p>
      <div
        className={cn(
          "retro-card flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-10 text-center transition-transform duration-300 sm:px-8 sm:py-16",
          isRevealed && "-rotate-1 scale-[1.02] border-primary"
        )}
      >
        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground sm:mb-8 sm:text-base">
          <Sparkles className="size-4 sm:size-5" />
          {isRevealed ? "Pemenang" : isRolling ? "Pengundian Berjalan..." : "Ready"}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={display?.key ?? "empty"}
            initial={reduceMotion ? false : isRolling ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : isRolling ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : isRolling ? 0.08 : 0.4, ease: "easeOut" }}
            className={cn(
              "flex items-center justify-center gap-3 font-mono font-extrabold leading-tight tracking-widest text-foreground sm:gap-4",
              "text-[clamp(2.25rem,11vw,8rem)]",
              isRevealed && "text-primary"
            )}
          >
            {!isRolling && <Gift className="size-[0.6em] shrink-0" />}
            {display?.plateNumber ?? ""}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
