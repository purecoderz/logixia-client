import { useParams } from "react-router-dom";
import { useLiveRoom } from "../hooks/useLiveRoom";
import { InstructorLiveRoomPage } from "./InstructorLiveRoomPage";
import { StudentLiveRoomPage } from "./StudentLiveRoomPage";

// Keep one connection mounted while the server resolves the participant's role.
export function LiveRoomPage() {
  const {id}=useParams<{id:string}>();
  return <ConnectedLiveRoom key={id ?? "1"} sessionId={Number(id || 1)}/>;
}

function ConnectedLiveRoom({sessionId}:{sessionId:number}) {
  const room=useLiveRoom(sessionId);
  // A disconnected room still needs the shared layout's disconnect message.
  if (!room.ready && !room.closedReason) return <div role="status" className="flex h-dvh items-center justify-center bg-[#161b22] text-[#c9d1d9]">Connecting to classroom…</div>;
  return room.isTeacher
    ? <InstructorLiveRoomPage room={room} sessionId={sessionId}/>
    : <StudentLiveRoomPage room={room} sessionId={sessionId}/>;
}
