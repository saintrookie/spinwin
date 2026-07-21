import type { Prize } from "@/types/domain";

/**
 * The prize the draw is currently on: the first active prize (in display
 * order) that hasn't had all its winners drawn yet. There's no manual
 * override — prizes always progress top-to-bottom automatically as each
 * one is completed, which is simpler and avoids an entire class of
 * "wrong prize selected" bugs.
 */
export function selectCurrentPrize(prizes: Prize[]): Prize | null {
  return (
    prizes
      .filter((p) => p.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .find((p) => p.awardedCount < p.quantity) ?? null
  );
}
