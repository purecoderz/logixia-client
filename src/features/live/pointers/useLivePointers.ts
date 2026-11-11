import { useCallback, useEffect, useReducer, useRef } from "react";
import RoomServices from "../services/liveRoomService";
import { canPoint, initialPointerState, pointerReducer, type PointerPosition } from "./pointer";

/** Owns transient pointer state and a trailing, 20Hz move queue. No file persistence. */
export function useLivePointers() {
  const [state, receive] = useReducer(pointerReducer, initialPointerState);
  const allowed = !!state.me && canPoint(state.me.role,state.me.id,state.writer);
  const permitted = useRef(allowed); permitted.current = allowed;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<PointerPosition | null>(null);
  const lastSent = useRef(0);
  const visible = useRef(false);
  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null; pending.current = null;
    if (visible.current) RoomServices.send("pointer_hide");
    visible.current = false;
  }, []);
  const move = useCallback((position: PointerPosition) => {
    if (!permitted.current) return;
    pending.current = position;
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      if (permitted.current && pending.current) {
        RoomServices.send("pointer_move",pending.current);
        lastSent.current = Date.now(); visible.current = true;
      }
      pending.current = null;
    }, Math.max(0,55-(Date.now()-lastSent.current)));
  }, []);
  const click = useCallback((position: PointerPosition) => {
    if (permitted.current) {
      move(position);
      RoomServices.send("pointer_click",position); visible.current = true;
    }
  }, [move]);
  useEffect(() => { if (!allowed) hide(); }, [allowed,hide]);
  useEffect(() => {
    const blur = () => hide();
    const visibility = () => { if (document.hidden) hide(); };
    window.addEventListener("blur",blur); document.addEventListener("visibilitychange",visibility);
    return () => { hide(); window.removeEventListener("blur",blur); document.removeEventListener("visibilitychange",visibility); };
  }, [hide]);
  return {pointers:Object.values(state.pointers), receive, move, click, hide};
}
export type LivePointers = ReturnType<typeof useLivePointers>;
