import confetti from "canvas-confetti";

export function fireWinnerConfetti() {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const duration = 1800;
  const end = Date.now() + duration;

  const colors = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#c084fc"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 140,
    spread: 100,
    origin: { y: 0.5 },
    startVelocity: 45,
    colors,
  });
}
