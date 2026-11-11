import { SessionMaterialsButton } from "../components/SessionMaterials";
import { useState } from "react";
import { ClipboardCheck, Power } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { LiveRoomLayout } from "../components/LiveRoomLayout";
import type { LiveRoom } from "../hooks/useLiveRoom";

export function InstructorLiveRoomPage({room, sessionId}:{room:LiveRoom;sessionId:number}) {
  const [endOpen,setEndOpen]=useState(false);
  const [attendanceOpen,setAttendanceOpen]=useState(false);
  return <LiveRoomLayout room={room} sessionId={sessionId} controls={<>
    <SessionMaterialsButton sessionId={sessionId}/>
          {room.isTeacher && (
            <button
              type="button"
              disabled={room.attendancePending || room.attendance !== null}
              onClick={() => setAttendanceOpen(true)}
              aria-label={room.attendance ? "Attendance taken" : "Take attendance"}
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border border-[#3fb950]/50 px-3 text-sm font-bold text-[#3fb950] hover:bg-[#3fb950]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 md:px-4"
            >
              <ClipboardCheck size={18} aria-hidden />
              <span className="hidden md:inline">
                {room.attendance
                  ? "Attendance taken"
                  : room.attendancePending
                    ? "Recording…"
                    : "Take attendance"}
              </span>
            </button>
          )}
          {room.isTeacher && (
            <button
              type="button"
              onClick={() => setEndOpen(true)}
              aria-label="End class"
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-md bg-[#da3633] px-3 text-sm font-bold text-white hover:bg-[#f85149] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:px-4"
            >
              <Power size={18} aria-hidden />
              <span className="hidden md:inline">End class</span>
            </button>
          )}  </>} dialogs={<>
      <ConfirmModal
        isOpen={attendanceOpen}
        title="Take attendance"
        message="Record every eligible student currently connected to this live room as present? Attendance can only be taken once for this session."
        confirmText="Record attendance"
        variant="info"
        onConfirm={() => {
          room.takeAttendance();
          setAttendanceOpen(false);
        }}
        onClose={() => setAttendanceOpen(false)}
      />
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
      <AlertModal
        isOpen={room.attendanceError !== null}
        title="Attendance wasn’t recorded"
        message={room.attendanceError ?? "Please try again."}
        variant="warning"
        buttonText="Close"
        onClose={room.dismissAttendanceError}
      />
  </>}/>;
}
