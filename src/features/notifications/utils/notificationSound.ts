let sharedAudioCtx: AudioContext | null = null;
let lastPlayedAt = 0;

const MIN_INTERVAL_MS = 1500;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctor();
  }
  return sharedAudioCtx;
}

/** Plays a soft two-tone chime when a new notification arrives, debounced across bell instances. */
export function playNotificationSound(): void {
  const nowMs = Date.now();
  if (nowMs - lastPlayedAt < MIN_INTERVAL_MS) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }

  lastPlayedAt = nowMs;
  const start = ctx.currentTime;

  const notes = [
    { freq: 587.33, offset: 0, duration: 0.14 }, // D5
    { freq: 880.0, offset: 0.1, duration: 0.22 }, // A5
  ];

  for (const { freq, offset, duration } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start + offset);

    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.08, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + offset + duration,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start + offset);
    osc.stop(start + offset + duration + 0.02);
  }
}
