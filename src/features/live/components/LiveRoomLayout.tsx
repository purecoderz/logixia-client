import { SessionRoomTitle } from "../components/SessionMaterials";
// pages/LiveRoom/LiveRoomPage.tsx
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  MessageSquare,
  Mic,
  MicOff,
  Terminal,
} from "lucide-react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import type { LiveRoom } from "../hooks/useLiveRoom";
import { AlertModal } from "../../../components/ui/AlertModal";
import { useRoomAudio } from "../hooks/useRoomAudio";

import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { ParticipantsList } from "../components/classroom/ParticipantsList";
import { ChatPanel } from "../components/classroom/ChatPanel";
import { AudioStatusButton } from "../components/classroom/AudioStatusButton";
import { FloatingTerminal } from "../components/classroom/FloatingTerminal";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import { Drawer } from "@/features/workspace/components/ui/Drawer";

function explainClose(code: string | null, reason: string): string {
  if (reason === "Not a member") return "You're not part of this class.";
  if (reason === "Class has not started")
    return "The class hasn't started yet. Try again soon.";
  if (reason === "Class ended") return "The class has ended.";
  if (code === "1006") return "Connection lost. Check your network.";
  return reason || "Disconnected.";
}

export function LiveRoomLayout({ room, sessionId, controls, dialogs }: { room:LiveRoom; sessionId:number; controls:ReactNode; dialogs?:ReactNode }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [chatOpen, setChatOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const closeMessage = room.closedReason
    ? explainClose(room.closedCode, room.closedReason)
    : null;

  const audio = useRoomAudio({
    sessionId: sessionId,
    myId: room.myId,
    speakers: room.speakers,
    canSpeak: room.canSpeak,
    sendMic: room.sendMic,
  });
  const showTerminal = room.ready && !room.canWrite;

  const [terminalOpen, setTerminalOpen] = useLocalStorage<boolean>(
    "room:terminal-open",
    true,
  );

  // Built once, shown in the sidebar on desktop and in the drawer on mobile
  const roomPanels = (
    <PanelGroup direction="vertical" autoSaveId="room-side-v">
      <Panel defaultSize={30} minSize={10}>
        <div className="h-full overflow-y-auto [&>section]:min-h-full">
          <ParticipantsList
            participants={room.participants}
            canGrant={room.isTeacher}
            writerId={room.writerId}
            onGrant={room.grantWriter}
            onRevoke={room.revokeWriter}
          />
        </div>
      </Panel>

      <PanelResizeHandle className="my-0.5 h-1.5 rounded bg-[#21262d] transition-colors hover:bg-[#58a6ff]/60" />

      <Panel defaultSize={70} minSize={20}>
        <div className="flex h-full flex-col">
          <ChatPanel messages={room.messages} onSend={room.sendMessage} />
        </div>
      </Panel>
    </PanelGroup>
  );

  return (
    <div className="flex h-dvh flex-col bg-[#161b22] text-[#c9d1d9]">
      <header className="flex h-13 shrink-0 items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 rounded-md border border-[#30363d] px-3 py-1 text-sm hover:bg-[#21262d]"
          >
            Leave
          </button>
          <span className="truncate text-sm font-semibold text-white md:text-base">
            <SessionRoomTitle sessionId={sessionId} />
          </span>
          <span className="shrink-0 text-[11px] font-bold tracking-wider text-[#3fb950]">
            LIVE
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Open chat and participants"
              className="flex h-10 min-w-10 items-center justify-center rounded-md border border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
            >
              <MessageSquare size={18} aria-hidden />
            </button>
          )}

          <AudioStatusButton status={audio.status} onClick={audio.fix} />
          {showTerminal && (
            <button
              type="button"
              onClick={() => setTerminalOpen((open) => !open)}
              aria-pressed={terminalOpen}
              aria-label={
                terminalOpen
                  ? "Hide instructor's terminal"
                  : "Show instructor's terminal"
              }
              className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff] md:px-4 ${
                terminalOpen
                  ? "border-[#58a6ff]/60 text-[#58a6ff]"
                  : "border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d]"
              }`}
            >
              <Terminal size={18} aria-hidden />
              <span className="hidden md:inline">Terminal</span>
            </button>
          )}

          {room.canSpeak && (
            <button
              type="button"
              onClick={audio.toggleMic}
              aria-pressed={audio.micOn}
              aria-label={
                audio.micOn ? "Turn microphone off" : "Turn microphone on"
              }
              className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold md:px-4 ${
                audio.micOn
                  ? "bg-[#238636] text-white"
                  : "border border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d]"
              }`}
            >
              {audio.micOn ? (
                <Mic size={18} aria-hidden />
              ) : (
                <MicOff size={18} aria-hidden />
              )}
              <span className="hidden md:inline">
                {audio.micOn ? "Mic on" : "Mic off"}
              </span>
            </button>
          )}

          {controls}

        </div>
        {audio.error && (
          <p
            role="alert"
            className="shrink-0 bg-[#161b22] px-4 py-1 text-xs text-[#f85149]"
          >
            {audio.error}
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal" autoSaveId="room-h">
          <Panel id="workspace" order={1} defaultSize={78} minSize={40}>
            <CodeWorkspace
              live
              embedded
              liveFiles={room.files}
              liveActivePath={room.activePath}
              readOnly={!room.canWrite}
              sendFiles={room.sendCode}
              sendDelete={room.sendDelete}
              sendRename={room.sendRename}
              sendActive={room.sendActive}
              currentLine={room.currentLine}
              storageKey={`session:${sessionId}`}
              title="Live classroom"
              onTerminalLines={room.sendTerminal}
            />
          </Panel>

          {!isMobile && (
            <>
              <PanelResizeHandle className="w-1 bg-[#21262d] transition-colors hover:bg-[#58a6ff]/60" />
              <Panel
                id="sidebar"
                order={2}
                defaultSize={22}
                minSize={15}
                maxSize={40}
              >
                <aside className="flex h-full flex-col gap-2 bg-[#161b22] p-2">
                  {roomPanels}
                </aside>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {isMobile && (
        <Drawer side="right" open={chatOpen} onClose={() => setChatOpen(false)}>
          <div className="flex h-full flex-col gap-2 p-2">{roomPanels}</div>
        </Drawer>
      )}

      {dialogs}

      <AlertModal
        isOpen={closeMessage !== null && !dismissed}
        title="Disconnected"
        message={closeMessage ?? ""}
        variant="warning"
        buttonText="Leave class"
        onClose={() => {
          setDismissed(true);
          navigate(-1);
        }}
      />
      {showTerminal && (
        <FloatingTerminal
          open={terminalOpen && showTerminal}
          onClose={() => setTerminalOpen(false)}
          isMobile={isMobile}
          lines={room.terminalLines}
        />
      )}
    </div>
  );
}
