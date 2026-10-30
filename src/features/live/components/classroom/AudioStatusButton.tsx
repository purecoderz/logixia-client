// components/LiveRoom/AudioStatusButton.tsx
import { AlertTriangle, Loader2, Volume2, VolumeX } from "lucide-react";
import type { AudioStatus } from "../../hooks/useRoomAudio";

const VIEW = {
  idle:       { text: "Audio",        label: "No one is speaking right now",        tone: "border-[#30363d] text-[#8b949e]",              Icon: VolumeX },
  connecting: { text: "Connecting",   label: "Connecting to the audio",             tone: "border-[#d29922]/50 text-[#d29922]",           Icon: Loader2 },
  live:       { text: "Audio on",     label: "Audio connected. Tap to reconnect",   tone: "border-[#238636]/60 text-[#3fb950]",           Icon: Volume2 },
  blocked:    { text: "Enable sound", label: "Sound is blocked. Tap to turn it on", tone: "border-[#d29922] bg-[#d29922] text-[#0d1117]", Icon: VolumeX },
  problem:    { text: "Reconnect",    label: "Can't hear? Tap to reconnect",        tone: "border-[#f85149] text-[#f85149]",              Icon: AlertTriangle },
} as const;

export function AudioStatusButton({ status, onClick }: { status: AudioStatus; onClick: () => void }) {
  const { text, label, tone, Icon } = VIEW[status];

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff] md:px-4 ${tone}`}
      >
        <Icon size={18} aria-hidden className={status === "connecting" ? "animate-spin" : ""} />
        <span className="hidden md:inline">{text}</span>
      </button>
      <span role="status" className="sr-only">{label}</span>
    </>
  );
}