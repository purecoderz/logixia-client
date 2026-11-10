import { Hand } from "lucide-react";
import { LiveRoomLayout } from "../components/LiveRoomLayout";
import type { LiveRoom } from "../hooks/useLiveRoom";
import { useAccessVoice } from "../hooks/useAccessVoice";

export function StudentLiveRoomPage({room, sessionId}:{room:LiveRoom;sessionId:number}) {
  useAccessVoice(room.canWrite, room.isStudent);
  return <LiveRoomLayout room={room} sessionId={sessionId} controls={<>
          {room.isStudent && (
            <button
              type="button"
              onClick={room.toggleHand}
              aria-pressed={room.handRaised}
              aria-label={room.handRaised ? "Lower hand" : "Raise hand"}
              className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold md:px-4 ${
                room.handRaised
                  ? "bg-[#30363d] text-white"
                  : "bg-[#d29922] text-[#0d1117]"
              }`}
            >
              <Hand
                size={18}
                fill={room.handRaised ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="hidden md:inline">
                {room.handRaised ? "Lower hand" : "Raise hand"}
              </span>
            </button>
          )}

  </>}/>;
}
