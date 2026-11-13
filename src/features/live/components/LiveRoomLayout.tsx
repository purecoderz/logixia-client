import { PointerSurface } from "../pointers/PointerSurface";
import { SessionElapsedTimer, SessionRoomTitle } from "../components/SessionMaterials";
// pages/LiveRoom/LiveRoomPage.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Terminal,
  CheckCircle2,
  X,
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
import { LiveReeborgPanel } from "@/features/arcade/botMaze/LiveReeborgPanel";

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
  const [attendanceNotice, setAttendanceNotice] = useState(false);
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

  useEffect(() => {
    if (!room.attendance) return;
    setAttendanceNotice(true);
    const timer = window.setTimeout(() => setAttendanceNotice(false), 8_000);
    return () => clearTimeout(timer);
  }, [room.attendance?.taken_at]);

  const [terminalOpen, setTerminalOpen] = useLocalStorage<boolean>(
    "room:terminal-open",
    true,
  );
  const reeborgOpen = room.reeborg.open;

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

      <PanelResizeHandle className="my-0.5 h-1.5 rounded bg-hover transition-colors hover:bg-accent/40" />

      <Panel defaultSize={70} minSize={20}>
        <div className="flex h-full flex-col">
          <ChatPanel messages={room.messages} onSend={room.sendMessage} />
        </div>
      </Panel>
    </PanelGroup>
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas text-body">
      <header className="flex h-13 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 rounded-md border border-line px-3 py-1 text-sm text-body hover:bg-hover"
          >
            Leave
          </button>
          <span className="truncate text-sm font-semibold text-foreground md:text-base">
            <SessionRoomTitle sessionId={sessionId} />
          </span>
          <span className="shrink-0 text-[11px] font-bold tracking-wider text-[#3fb950]">
            LIVE
          </span>
          <SessionElapsedTimer sessionId={sessionId} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Open chat and participants"
              className="flex h-10 min-w-10 items-center justify-center rounded-md border border-line text-body hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <MessageSquare size={18} aria-hidden />
            </button>
          )}

          <AudioStatusButton status={audio.status} onClick={audio.fix} />
          {room.isTeacher && (
            <button
              type="button"
              onClick={() =>
                room.sendReeborg({
                  open: !reeborgOpen,
                  level_id: room.reeborg.level_id,
                  run: null,
                })
              }
              aria-pressed={reeborgOpen}
              aria-label={
                reeborgOpen ? "Close Reeborg mode" : "Open Reeborg mode"
              }
              className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:px-4 ${
                reeborgOpen
                  ? "border-accent/60 bg-accent/15 text-accent"
                  : "border-line text-body hover:bg-hover"
              }`}
            >
              <Bot size={18} aria-hidden />
              <span className="hidden md:inline">Reeborg</span>
            </button>
          )}
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
              className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:px-4 ${
                terminalOpen
                  ? "border-accent/60 text-accent"
                  : "border-line text-body hover:bg-hover"
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
                  : "border border-line text-body hover:bg-hover"
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
            className="shrink-0 bg-surface px-4 py-1 text-xs text-danger"
          >
            {audio.error}
          </p>
        )}
      </header>

      {attendanceNotice && room.attendance && (
        <div
          role="status"
          className="fixed right-4 top-16 z-[70] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-[#3fb950]/40 bg-[#16251c] px-4 py-3 text-sm text-[#7ee787] shadow-2xl"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Attendance recorded</p>
            <p className="mt-0.5 text-xs text-[#a7d7b5]">
              {room.attendance.present_count} {room.attendance.present_count === 1 ? "participant was" : "participants were"} marked present.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAttendanceNotice(false)}
            aria-label="Dismiss attendance notice"
            className="ml-1 rounded p-1 text-[#a7d7b5] hover:bg-white/10 hover:text-white"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal" autoSaveId="room-h">
          <Panel id="workspace" order={1} defaultSize={78} minSize={40}>
            <CodeWorkspace
              renderPointerSurface={(panel,path,children)=>panel === "terminal" && !room.canWrite ? children : <PointerSurface panel={panel} path={path} controller={room.pointers}>{children}</PointerSurface>}
              live
              embedded
              liveFiles={room.files}
              liveFolders={room.folders}
              liveExpandedFolders={room.expandedFolders}
              liveActivePath={room.activePath}
              readOnly={!room.canWrite}
              sendFiles={room.sendCode}
              sendFolder={room.sendFolder}
              sendFolderToggle={room.sendFolderToggle}
              sendDelete={room.sendDelete}
              sendRename={room.sendRename}
              sendActive={room.sendActive}
              currentLine={room.currentLine}
              storageKey={`session:${sessionId}`}
              title="Live classroom"
              layout={reeborgOpen ? "split" : undefined}
              asideTitle={reeborgOpen ? "Reeborg World" : undefined}
              aside={
                reeborgOpen ? (
                  <LiveReeborgPanel
                    levelId={room.reeborg.level_id}
                    canControl={room.canWrite}
                    onLevelChange={(levelId) =>
                      room.sendReeborg({
                        open: true,
                        level_id: levelId,
                        run: null,
                      })
                    }
                    runRequest={room.reeborg.run ?? null}
                  />
                ) : undefined
              }
              onRunFile={
                reeborgOpen
                  ? (_path, content) => {
                      room.sendReeborg({
                        open: true,
                        level_id: room.reeborg.level_id,
                        run: { code: content, seq: Date.now() },
                      });
                      return true;
                    }
                  : undefined
              }
              onTerminalLines={room.sendTerminal}
            />
          </Panel>

          {!isMobile && (
            <>
              <PanelResizeHandle className="w-1 bg-hover transition-colors hover:bg-accent/40" />
              <Panel
                id="sidebar"
                order={2}
                defaultSize={22}
                minSize={15}
                maxSize={40}
              >
                <aside className="flex h-full flex-col gap-2 bg-canvas p-2">
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
          renderSurface={children=><PointerSurface panel="terminal" controller={room.pointers}>{children}</PointerSurface>}
          lines={room.terminalLines}
        />
      )}
    </div>
  );
}
