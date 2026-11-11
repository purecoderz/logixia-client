import type { EditorAnchor } from "./editorAnchor";
import type { ExplorerAnchor } from "./explorerAnchor";
import type { Sender, ServerMessage } from "../services/liveRoomService";
export type PointerPanel = "explorer" | "editor" | "terminal";
export interface PointerPosition { panel: PointerPanel; x: number; y: number; path?: string; anchor?: EditorAnchor | ExplorerAnchor }
export interface RemotePointer extends PointerPosition { owner: Sender; click?: number }
export function validPointer(value: unknown): value is PointerPosition {
  if (!value || typeof value !== "object") return false;
  const p = value as PointerPosition;
  if (p.anchor?.kind === "editor" && (p.panel !== "editor" || !p.path || !Number.isSafeInteger(p.anchor.offset) || p.anchor.offset < 0 || p.anchor.offset > 100_000)) return false;
  if (p.anchor?.kind === "explorer" && (
    p.panel !== "explorer" || !p.anchor.path || p.anchor.path.length > 200 ||
    !Number.isFinite(p.anchor.rowX) || p.anchor.rowX < 0 || p.anchor.rowX > 1 ||
    !Number.isFinite(p.anchor.rowY) || p.anchor.rowY < 0 || p.anchor.rowY > 1
  )) return false;
  if (p.anchor && p.anchor.kind !== "editor" && p.anchor.kind !== "explorer") return false;
  return ["explorer", "editor", "terminal"].includes(p.panel) && typeof p.x === "number" && typeof p.y === "number" && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1 && (p.path === undefined || typeof p.path === "string");
}
export const canPoint = (role: string, id: string, writer: string | null) => role === "admin" || role === "instructor" || id === writer;
export interface PointerState { pointers: Record<string, RemotePointer>; roster: Sender[]; writer: string | null; me: Sender | null }
export const initialPointerState: PointerState = { pointers: {}, roster: [], writer: null, me: null };
export function pointerReducer(state: PointerState, message: ServerMessage | {type:"reset"}): PointerState {
  if (message.type === "reset") return initialPointerState;
  if (message.type === "snapshot") {
    const {roster = [], writer, me, pointers = []} = message.data;
    const next: PointerState = {pointers: {}, roster, writer, me};
    for (const p of pointers) {
      const owner = roster.find(user=>user.id === p.user_id);
      if (owner && owner.id !== me.id && canPoint(owner.role,owner.id,writer) && validPointer(p)) next.pointers[owner.id] = {...p, owner};
    }
    return next;
  }
  if (message.type === "user_joined") return {...state, roster:[...state.roster.filter(user=>user.id !== message.data.id),message.data]};
  if (message.type === "grant_writer" || message.type === "revoke_writer" || message.type === "user_left") {
    const writer = message.type === "grant_writer" ? message.data.user_id : message.type === "revoke_writer" || state.writer === message.data.id ? null : state.writer;
    const roster = message.type === "user_left" ? state.roster.filter(user=>user.id !== message.data.id) : state.roster;
    const pointers = Object.fromEntries(Object.entries(state.pointers).filter(([id,p])=>roster.some(user=>user.id === id) && canPoint(p.owner.role,id,writer)));
    return {...state,writer,roster,pointers};
  }
  if (message.type === "pointer_hide") {
    const id = message.from?.id ?? message.data.user_id;
    const pointers = {...state.pointers}; if (id) delete pointers[id];
    return {...state,pointers};
  }
  if (message.type === "pointer_move" || message.type === "pointer_click") {
    const owner = message.from;
    if (owner.id === state.me?.id || !canPoint(owner.role,owner.id,state.writer) || !validPointer(message.data)) return state;
    return {...state,pointers:{...state.pointers,[owner.id]:{...message.data,owner,click:message.type === "pointer_click" ? (state.pointers[owner.id]?.click ?? 0)+1 : state.pointers[owner.id]?.click}}};
  }
  return state;
}
