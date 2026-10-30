// services/liveRoomService.ts
import type { TerminalLine } from "../../../components/SmartTerminal/TerminalView";
import { refreshSession, expire } from "../../../lib/http";

export interface Sender {
  id: string;
  role: string;
  name: string;
}

export interface ChatEntry {
  from: Sender;
  data: { text: string };
}

export type ServerMessage =
  | {
      type: "snapshot";
      data: {
        files: Record<string, string>;
        active?: string | null;
        writer: string | null;
        speakers?: string[];
        me: Sender;
        roster?: Sender[];
        chat: ChatEntry[];
      };
    }
  | {
      type: "code";
      from: Sender;
      data: { file: string; content: string; line?: number };
    }
  | { type: "delete_path"; from: Sender; data: { path: string } }
  | { type: "rename_path"; from: Sender; data: { from: string; to: string } }
  | { type: "active_file"; from: Sender; data: { path: string } }
  | { type: "chat"; from: Sender; data: { text: string } }
  | { type: "raise_hand"; from: Sender; data: {} }
  | { type: "grant_writer"; from: Sender; data: { user_id: string } }
  | { type: "revoke_writer"; from?: Sender; data: {} }
  | { type: "mic_on"; from: Sender; data: {} }
  | { type: "mic_off"; from: Sender; data: {} }
  | { type: "user_joined"; data: Sender }
  | { type: "user_left"; data: { id: string } }
  | { type: "terminal"; from: Sender; data: { lines: TerminalLine[] } }
  | { type: "lower_hand"; from: Sender; data: {} };

type Handlers = {
  onMessage: (msg: ServerMessage) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (message: string) => void;
};

let socket: WebSocket | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let attempts = 0;

const MAX_ATTEMPTS = 6;
const AUTH_CLOSE_CODES = [4401]; // policy violation / session revoked
const NO_RETRY_CODES = [1000, 1008];

function open(url: string, h: Handlers) {
  const ws = new WebSocket(url);
  socket = ws;
  let opened = false;

  ws.onopen = () => {
    opened = true;
    attempts = 0;
  };

  ws.onmessage = (event) => {
    if (socket !== ws) return; // a socket we already replaced or closed
    let msg: ServerMessage;
    try {
      msg = JSON.parse(event.data) as ServerMessage;
    } catch {
      return; // not valid JSON, ignore it
    }
    h.onMessage(msg);
  };

  ws.onerror = () => {
    // a close event always follows, handled there
  };

  ws.onclose = (event) => {
    if (socket !== ws) return; // we closed it ourselves

    if (AUTH_CLOSE_CODES.includes(event.code)) {
      expire();
      h.onClose?.(event);
      return;
    }

    if (NO_RETRY_CODES.includes(event.code)) {
      h.onClose?.(event); // room handles 1008 itself, no login redirect
      return;
    }

    if (event.code === 1000) {
      h.onClose?.(event);
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      h.onError?.("Could not reach the live server.");
      h.onClose?.(event);
      return;
    }

    const delay = Math.min(1000 * 2 ** attempts++, 30_000);

    retryTimer = setTimeout(async () => {
      if (socket !== ws) return; // disconnect() was called while waiting

      // never opened = handshake rejected, likely an expired access cookie
      if (!opened && !(await refreshSession())) {
        expire();
        h.onClose?.(event);
        return;
      }

      if (socket !== ws) return;
      open(url, h);
    }, delay);
  };
}

const RoomServices = {
  connect(
    url: string,
    onMessage: (msg: ServerMessage) => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (message: string) => void,
  ) {
    RoomServices.disconnect();
    attempts = 0;
    open(url, { onMessage, onClose, onError });
  },

  send(type: string, data: object = {}) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    }
  },

  disconnect() {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    const s = socket;
    socket = null; // clear first so onclose ignores it
    s?.close();
  },
};

export default RoomServices;
