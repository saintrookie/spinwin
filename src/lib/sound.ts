export type SoundName = "tick" | "win" | "drumroll" | "click";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function tone(
  ctx: AudioContext,
  { frequency, duration, type = "sine", gain = 0.15, delay = 0 }: {
    frequency: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
  }
) {
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  const startAt = ctx.currentTime + delay;
  envelope.gain.setValueAtTime(0, startAt);
  envelope.gain.linearRampToValueAtTime(gain, startAt + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(envelope);
  envelope.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export function playSound(name: SoundName) {
  const ctx = getContext();
  if (!ctx) return;

  switch (name) {
    case "tick":
      tone(ctx, { frequency: 900, duration: 0.045, type: "square", gain: 0.05 });
      break;
    case "click":
      tone(ctx, { frequency: 500, duration: 0.06, type: "triangle", gain: 0.08 });
      break;
    case "drumroll":
      for (let i = 0; i < 6; i++) {
        tone(ctx, { frequency: 140, duration: 0.08, type: "sawtooth", gain: 0.06, delay: i * 0.09 });
      }
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
        tone(ctx, { frequency, duration: 0.5, type: "triangle", gain: 0.12, delay: i * 0.11 });
      });
      break;
  }
}
