import { SessionMaterialsButton } from "../components/SessionMaterials";
import { useState } from "react";
import { Power } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LiveRoomLayout } from "../components/LiveRoomLayout";
import type { LiveRoom } from "../hooks/useLiveRoom";

export function InstructorLiveRoomPage({room, sessionId}:{room:LiveRoom;sessionId:number}) {
  const [endOpen,setEndOpen]=useState(false);
  return <LiveRoomLayout room={room} sessionId={sessionId} controls={<>
    <SessionMaterialsButton sessionId={sessionId}/>
          {room.isTeacher && (
            <button
              type="button"
              onClick={() => setEndOpen(true)}
              aria-label="End class"
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-md bg-[#da3633] px-3 text-sm font-bold text-white hover:bg-[#f85149] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff] md:px-4"
            >
              <Power size={18} aria-hidden />
              <span className="hidden md:inline">End class</span>
            </button>
          )}  </>} dialogs={
      <ConfirmModal
        isOpen={endOpen}
        title="End class"
        message="End the class for everyone? Students will be disconnected and the code is saved."
        confirmText="End class"
        variant="danger"
        onConfirm={() => {
          room.closeClass();
          setEndOpen(false);
        }}
        onClose={() => setEndOpen(false)}
      />
  }/>;
}
