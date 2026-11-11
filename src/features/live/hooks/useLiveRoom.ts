import { useLivePointers } from "../pointers/useLivePointers";
// hooks/useLiveRoom.ts
import { useCallback, useEffect, useRef, useState } from "react";
import RoomServices from "../services/liveRoomService";
import type { AttendanceReceipt } from "../services/liveRoomService";
import { useAuth } from "../../auth/context/AuthContext";
import type { TerminalLine } from "../../../components/SmartTerminal/TerminalView";

export interface Participant {
  id: string;
  name: string;
  role: string;
  handRaised: boolean;
  raisedAt: number | null;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
}

const TEACHERS = ["admin", "instructor"];

// A folder path covers everything inside it
const inside = (key: string, path: string) =>
  key === path || key.startsWith(path + "/");

const withoutPath = (files: Record<string, string>, path: string) =>
  Object.fromEntries(
    Object.entries(files).filter(([key]) => !inside(key, path)),
  );

const withRenamedPath = (
  files: Record<string, string>,
  from: string,
  to: string,
) =>
  Object.fromEntries(
    Object.entries(files).map(([key, value]) => [
      inside(key, from) ? to + key.slice(from.length) : key,
      value,
    ]),
  );

const folderParents = (path: string) => {
  const parts = path.split("/").slice(0, -1);
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
};

const withoutFolderPath = (folders: string[], path: string) =>
  folders.filter((folder) => !inside(folder, path));

const withRenamedFolders = (folders: string[], from: string, to: string) =>
  folders.map((folder) =>
    inside(folder, from) ? to + folder.slice(from.length) : folder,
  );

// Same limits as the server, so a valid terminal is never rejected
const MAX_LINES = 200;
const MAX_LINE_CHARS = 2_000;
const MAX_TOTAL_CHARS = 100_000;

function shrink(lines: TerminalLine[]): TerminalLine[] {
  const out = lines
    .slice(-MAX_LINES)
    .map((l) => ({ kind: l.kind, text: l.text.slice(0, MAX_LINE_CHARS) }));
  let total = out.reduce((n, l) => n + l.text.length, 0);
  let start = 0;
  while (total > MAX_TOTAL_CHARS && start < out.length - 1) {
    total -= out[start].text.length;
    start++;
  }
  return out.slice(start);
}

export function useLiveRoom(sessionId: number = 1) {
  const pointers = useLivePointers();
  const receivePointer = pointers.receive;
  const { profile } = useAuth();
  const myId = profile?.id ?? null;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [folders, setFolders] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [writerId, setWriterId] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [closedCode, setClosedCode] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReceipt | null>(null);
  const [attendancePending, setAttendancePending] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const attendanceTimer = useRef<number | null>(null);

  // keeps the latest id for the socket handler, which is created only once
  const myIdRef = useRef(myId);
  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  useEffect(() => {
    if (!myId) return; // connect only after the profile is loaded

    RoomServices.connect(
      `ws://localhost:8000/live/${sessionId}`,
      (msg) => {
        receivePointer(msg);
        switch (msg.type) {
          case "snapshot":
            setFiles(msg.data.files);
            setFolders(msg.data.folders ?? []);
            setExpandedFolders(msg.data.expanded_folders ?? []);
            setActivePath(msg.data.active ?? null);
            setWriterId(msg.data.writer);
            setSpeakers(msg.data.speakers ?? []);
            setMyRole(msg.data.me.role);
            setAttendance(msg.data.attendance ?? null);
            if (msg.data.roster) {
              setParticipants(
                msg.data.roster.map((p) => ({
                  ...p,
                  handRaised: false,
                  raisedAt: null,
                })),
              );
            }
            setMessages(
              msg.data.chat.map((c) => ({
                id: crypto.randomUUID(),
                author: c.from.id === myIdRef.current ? "You" : c.from.name,
                text: c.data.text,
              })),
            );
            break;

          case "chat":
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                author: msg.from.id === myIdRef.current ? "You" : msg.from.name,
                text: msg.data.text,
              },
            ]);
            break;

          case "code":
            setFiles((prev) => ({
              ...prev,
              [msg.data.file]: msg.data.content,
            }));
            setFolders((prev) => [
              ...new Set([...prev, ...folderParents(msg.data.file)]),
            ]);
            if (msg.data.line) setCurrentLine(msg.data.line);
            break;

          case "create_folder":
            setFolders((prev) =>
              prev.includes(msg.data.path) ? prev : [...prev, msg.data.path],
            );
            break;

          case "folder_toggle":
            setExpandedFolders((prev) => msg.data.expanded
              ? prev.includes(msg.data.path) ? prev : [...prev, msg.data.path]
              : prev.filter((path) => path !== msg.data.path));
            break;

          case "delete_path":
            setFiles((prev) => withoutPath(prev, msg.data.path));
            setFolders((prev) => withoutFolderPath(prev, msg.data.path));
            setExpandedFolders((prev) => withoutFolderPath(prev, msg.data.path));
            break;

          case "rename_path":
            setFiles((prev) =>
              withRenamedPath(prev, msg.data.from, msg.data.to),
            );
            setFolders((prev) =>
              withRenamedFolders(prev, msg.data.from, msg.data.to),
            );
            setExpandedFolders((prev) =>
              withRenamedFolders(prev, msg.data.from, msg.data.to),
            );
            break;

          case "active_file":
            setActivePath(msg.data.path);
            break;

          case "terminal":
            setTerminalLines(msg.data.lines);
            break;

          case "mic_on":
            setSpeakers((prev) =>
              prev.includes(msg.from.id) ? prev : [...prev, msg.from.id],
            );
            break;

          case "mic_off":
            setSpeakers((prev) => prev.filter((id) => id !== msg.from.id));
            break;

          case "grant_writer":
            setWriterId(msg.data.user_id);
            // the picked student no longer needs the raised hand
            setParticipants((list) =>
              list.map((p) =>
                p.id === msg.data.user_id ? { ...p, handRaised: false } : p,
              ),
            );
            if (msg.data.user_id === myIdRef.current) setHandRaised(false);
            break;

          case "revoke_writer":
            setWriterId(null);
            break;

          case "raise_hand":
            setParticipants((list) =>
              list.map((p) =>
                p.id === msg.from.id
                  ? {
                      ...p,
                      handRaised: true,
                      raisedAt: p.handRaised ? p.raisedAt : Date.now(),
                    }
                  : p,
              ),
            );
            break;

          case "lower_hand":
            setParticipants((list) =>
              list.map((p) =>
                p.id === msg.from.id
                  ? { ...p, handRaised: false, raisedAt: null }
                  : p,
              ),
            );
            break;

          case "user_joined": // everyone receives this
            setParticipants((list) =>
              list.some((p) => p.id === msg.data.id)
                ? list
                : [...list, { ...msg.data, handRaised: false, raisedAt: null }],
            );
            break;

          case "user_left": // everyone receives this
            setParticipants((list) => list.filter((p) => p.id !== msg.data.id));
            setSpeakers((prev) => prev.filter((id) => id !== msg.data.id));
            break;

          case "attendance_taken":
            if (attendanceTimer.current !== null) {
              clearTimeout(attendanceTimer.current);
              attendanceTimer.current = null;
            }
            setAttendance(msg.data);
            setAttendancePending(false);
            setAttendanceError(null);
            break;

          case "attendance_error":
            if (attendanceTimer.current !== null) {
              clearTimeout(attendanceTimer.current);
              attendanceTimer.current = null;
            }
            setAttendancePending(false);
            setAttendanceError(msg.data.message);
            break;
        }
      },
      (event) => {
        receivePointer({type:"reset"});
        setClosedCode(String(event.code));
        setClosedReason(event.reason);
      },
      undefined,
      () => receivePointer({type:"reset"}),
    );

    return () => RoomServices.disconnect();
  }, [sessionId, myId]);

  const isTeacher = myRole !== null && TEACHERS.includes(myRole);
  const isStudent = myRole === "student";
  const ready = myRole !== null; // the snapshot has arrived, so the role is known
  // the teacher is paused while a student holds the pen
  const canWrite = isTeacher
    ? writerId === null
    : myId !== null && writerId === myId;
  // the teacher can always speak, and so can whoever holds the pen
  const canSpeak = isTeacher || canWrite;

  const sendMessage = (text: string) => RoomServices.send("chat", { text });

  const toggleHand = () => {
    RoomServices.send(handRaised ? "lower_hand" : "raise_hand");
    setHandRaised((prev) => !prev);
  };

  // Typing: the editor state updates on every keystroke, only the network send waits
  const pending = useRef<Record<string, { content: string; line?: number }>>(
    {},
  );
  const timer = useRef<number | null>(null);

  // Sends any typing that is still waiting. Safe to call early, before a delete or rename
  const flush = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    for (const [file, { content, line }] of Object.entries(pending.current)) {
      RoomServices.send("code", { file, content, line });
    }
    pending.current = {};
  };

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const sendCode = useCallback(
    (file: string, content: string, line?: number) => {
      if (!canWrite) return;
      setFiles((prev) => ({ ...prev, [file]: content }));
      setFolders((prev) => [
        ...new Set([...prev, ...folderParents(file)]),
      ]);
      pending.current[file] = { content, line }; // the line travels with the content
      if (timer.current === null) timer.current = window.setTimeout(flush, 120);
    },
    [canWrite],
  );

  const sendFolder = useCallback(
    (path: string) => {
      if (!canWrite) return;
      flush();
      RoomServices.send("create_folder", { path });
      setFolders((prev) =>
        prev.includes(path) ? prev : [...prev, path],
      );
    },
    [canWrite],
  );

  const sendFolderToggle = useCallback(
    (path: string, expanded: boolean) => {
      if (!isTeacher && !canWrite) return;
      RoomServices.send("folder_toggle", { path, expanded });
      setExpandedFolders((prev) => expanded
        ? prev.includes(path) ? prev : [...prev, path]
        : prev.filter((folder) => folder !== path));
    },
    [isTeacher, canWrite],
  );

  const sendDelete = useCallback(
    (path: string) => {
      if (!canWrite) return;
      flush(); // typing that is still waiting goes out first, so order is kept
      RoomServices.send("delete_path", { path });
      setFiles((prev) => withoutPath(prev, path));
      setFolders((prev) => withoutFolderPath(prev, path));
      setExpandedFolders((prev) => withoutFolderPath(prev, path));
    },
    [canWrite],
  );

  const sendRename = useCallback(
    (from: string, to: string) => {
      if (!canWrite) return;
      flush();
      RoomServices.send("rename_path", { from, to });
      setFiles((prev) => withRenamedPath(prev, from, to));
      setFolders((prev) => withRenamedFolders(prev, from, to));
      setExpandedFolders((prev) => withRenamedFolders(prev, from, to));
    },
    [canWrite],
  );

  const sendActive = useCallback(
    (path: string) => {
      if (!canWrite) return;
      flush(); // pending typing and new empty files go out first
      RoomServices.send("active_file", { path });
    },
    [canWrite],
  );

  // Terminal output: the whole (capped) list, at most every 150 ms
  const termPending = useRef<TerminalLine[] | null>(null);
  const termTimer = useRef<number | null>(null);

  const sendTerminal = useCallback(
    (lines: TerminalLine[]) => {
      if (!canWrite) return;
      termPending.current = shrink(lines);
      if (termTimer.current !== null) return; // a send is already scheduled
      termTimer.current = window.setTimeout(() => {
        termTimer.current = null;
        if (termPending.current) {
          RoomServices.send("terminal", { lines: termPending.current });
        }
        termPending.current = null;
      }, 150);
    },
    [canWrite],
  );

  useEffect(() => {
    return () => {
      if (termTimer.current !== null) clearTimeout(termTimer.current);
      if (attendanceTimer.current !== null)
        clearTimeout(attendanceTimer.current);
    };
  }, []);

  // Announces that my microphone is on or off (the audio itself goes to MediaMTX)
  const sendMic = useCallback(
    (on: boolean) => RoomServices.send(on ? "mic_on" : "mic_off"),
    [],
  );

  const grantWriter = (userId: string) =>
    RoomServices.send("grant_writer", { user_id: userId });
  const revokeWriter = () => RoomServices.send("revoke_writer");
  const closeClass = () => RoomServices.send("close");
  const takeAttendance = () => {
    if (!isTeacher || attendance || attendancePending) return;
    setAttendancePending(true);
    setAttendanceError(null);
    RoomServices.send("take_attendance");
    attendanceTimer.current = window.setTimeout(() => {
      attendanceTimer.current = null;
      setAttendancePending(false);
      setAttendanceError(
        "Attendance was not confirmed. Check your connection and try again.",
      );
    }, 10_000);
  };
  const dismissAttendanceError = () => setAttendanceError(null);

  return {
    pointers,
    participants,
    messages,
    files,
    folders,
    expandedFolders,
    activePath,
    writerId,
    speakers,
    terminalLines,
    handRaised,
    canWrite,
    canSpeak,
    isTeacher,
    isStudent,
    ready,
    closedReason,
    closedCode,
    currentLine,
    attendance,
    attendancePending,
    attendanceError,
    myId,
    sendMessage,
    toggleHand,
    sendCode,
    sendFolder,
    sendFolderToggle,
    sendDelete,
    sendRename,
    sendActive,
    sendTerminal,
    sendMic,
    grantWriter,
    revokeWriter,
    closeClass,
    takeAttendance,
    dismissAttendanceError,
  };
}

export type LiveRoom = ReturnType<typeof useLiveRoom>;
