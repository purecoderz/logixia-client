import type { TerminalLine } from "../../../components/SmartTerminal/TerminalView";

// services/liveRoomService.ts
let socket: WebSocket | null = null;

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
  | { type: "code"; from: Sender; data: { file: string; content: string; line?: number } }
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

const RoomServices = {
  connect(
    url: string,
    onMessage: (msg: ServerMessage) => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (message: string) => void,
  ) {
    RoomServices.disconnect();

    const ws = new WebSocket(url);
    socket = ws;

    ws.onopen = () => console.log("open");

    ws.onmessage = (event) => {
      if (socket !== ws) return; // a socket we already replaced or closed
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        return; // not valid JSON, ignore it
      }
      onMessage(msg);
    };

    ws.onclose = (event) => {
      if (socket !== ws) return; // we closed it ourselves, nothing to report
      onClose?.(event);
    };

    ws.onerror = () => {
      if (socket !== ws) return;
      onError?.("Could not reach the live server.");
    };
  },

  send(type: string, data: object = {}) {
    if (socket?.readyState === WebSocket.OPEN) {
      console.log({type,data})
      socket.send(JSON.stringify({ type, data }));
    }
  },

  disconnect() {
    socket?.close();
    socket = null;
  },
};

export default RoomServices;