// hooks/useLiveRoom.ts
import { useCallback, useEffect, useRef, useState } from "react";
import RoomServices from "../services/liveRoomService";
import { useAuth } from "../features/auth/context/AuthContext";
import type { TerminalLine } from "../components/SmartTerminal/TerminalView";

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
  const { profile } = useAuth();
  const myId = profile?.id ?? null;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activePath, setActivePath] = useState<string | null>(null);
  const [writerId, setWriterId] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [closedCode, setClosedCode] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

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
        switch (msg.type) {
          case "snapshot":
            setFiles(msg.data.files);
            setActivePath(msg.data.active ?? null);
            setWriterId(msg.data.writer);
            setSpeakers(msg.data.speakers ?? []);
            setMyRole(msg.data.me.role);
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
            if (msg.data.line) setCurrentLine(msg.data.line);
            break;

          case "delete_path":
            setFiles((prev) => withoutPath(prev, msg.data.path));
            break;

          case "rename_path":
            setFiles((prev) =>
              withRenamedPath(prev, msg.data.from, msg.data.to),
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
        }
      },
      (event) => {
        setClosedCode(String(event.code));
        setClosedReason(event.reason);
      },
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
      pending.current[file] = { content, line }; // the line travels with the content
      if (timer.current === null) timer.current = window.setTimeout(flush, 120);
    },
    [canWrite],
  );

  const sendDelete = useCallback(
    (path: string) => {
      if (!canWrite) return;
      flush(); // typing that is still waiting goes out first, so order is kept
      RoomServices.send("delete_path", { path });
      setFiles((prev) => withoutPath(prev, path));
    },
    [canWrite],
  );

  const sendRename = useCallback(
    (from: string, to: string) => {
      if (!canWrite) return;
      flush();
      RoomServices.send("rename_path", { from, to });
      setFiles((prev) => withRenamedPath(prev, from, to));
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

  return {
    participants,
    messages,
    files,
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
    myId,
    sendMessage,
    toggleHand,
    sendCode,
    sendDelete,
    sendRename,
    sendActive,
    sendTerminal,
    sendMic,
    grantWriter,
    revokeWriter,
    closeClass,
  };
}