// components/LiveRoom/ParticipantsList.tsx
import type { Participant } from "../../hooks/useLiveRoom";

interface ParticipantsListProps {
  participants: Participant[];
  canGrant?: boolean;                    // NEW: true for the teacher
  writerId?: string | null;              // NEW: who holds the pen now
  onGrant?: (userId: string) => void;    // NEW
  onRevoke?: () => void;                 // NEW
}

export function ParticipantsList({
  participants,
  canGrant = false,
  writerId = null,
  onGrant,
  onRevoke,
}: ParticipantsListProps) {
  const sorted = [...participants].sort((a, b) => {
    if (a.handRaised && b.handRaised) return (a.raisedAt ?? 0) - (b.raisedAt ?? 0);
    if (a.handRaised) return -1;
    if (b.handRaised) return 1;
    return 0;
  });
  const queue = sorted.filter((p) => p.handRaised);

  return (
    <section className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
      <h2 className="mb-2 text-xs font-semibold text-[#8b949e]">
        Participants · {participants.length}
      </h2>
      <ul className="space-y-1.5">
        {sorted.map((p) => {
          const isWriter = p.id === writerId;

          return (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{p.name}</span>

              <div className="flex shrink-0 items-center gap-1.5">
                {p.role === "instructor" && (
                  <span className="rounded bg-[#1f6feb] px-1.5 py-0.5 text-[11px] text-white">
                    Instructor
                  </span>
                )}

                {isWriter && (
                  canGrant ? (
                    <button
                      type="button"
                      onClick={onRevoke}
                      title="Take the pen back"
                      className="rounded bg-[#238636] px-1.5 py-0.5 text-[11px] font-bold text-white hover:bg-[#da3633]"
                    >
                      Writing · Revoke
                    </button>
                  ) : (
                    <span className="rounded bg-[#238636] px-1.5 py-0.5 text-[11px] font-bold text-white">
                      Writing
                    </span>
                  )
                )}

                {p.handRaised && !isWriter && (
                  canGrant ? (
                    <button
                      type="button"
                      onClick={() => onGrant?.(p.id)}
                      title="Give editor access"
                      className="rounded bg-[#d29922] px-1.5 py-0.5 text-[11px] font-bold text-[#0d1117] hover:bg-[#e3b341]"
                    >
                      #{queue.indexOf(p) + 1} Hand raised · Pick
                    </button>
                  ) : (
                    <span className="rounded bg-[#d29922] px-1.5 py-0.5 text-[11px] font-bold text-[#0d1117]">
                      #{queue.indexOf(p) + 1} Hand raised
                    </span>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}